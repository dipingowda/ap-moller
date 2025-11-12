import json
import os, duckdb, pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from langchain_google_genai import ChatGoogleGenerativeAI
#from guardrails import is_safe_select, enforce_limit

import google.generativeai as genai

from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
DB_PATH = os.getenv("DUCKDB_PATH", "olist.duckdb")


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCZ1FGMDUFdQ3aZVIxWkogvRIeg1kuLPVA")
DEFAULT_LIMIT = int(os.getenv("DEFAULT_LIMIT", "200"))



app = FastAPI(title="GenAI SQL Agent (LangChain)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or restrict to ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],  # <-- this fixes OPTIONS preflight
    allow_headers=["*"],
)

# DB connections
#con = duckdb.connect(DB_PATH)
db = SQLDatabase.from_uri(f"duckdb:///{DB_PATH}")

# LLM (Gemini)
genai.configure(api_key=GEMINI_API_KEY)
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY




llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",
    api_key=GEMINI_API_KEY,
    transport="rest"  # <-- important: avoids old gRPC v1beta transport
)
# NL→SQL chain (return SQL in intermediate steps)
db_chain = SQLDatabaseChain.from_llm(
    llm,
    db,
    verbose=False,
    return_intermediate_steps=True
)

class AskReq(BaseModel):
    query: str
    

class AskRes(BaseModel):
    sql: str
    rows: list[dict]
    columns: list[str]
    rowcount: int
    summary: str | None = None

def analyze_results(sql: str, df: pd.DataFrame) -> str:
    """Generate a clear, business-oriented natural language summary of the query result."""
    try:
        if df.empty:
            return "No matching data found for your query."

        # Prepare compact sample
        sample_data = df.head(10).to_dict(orient="records")

        prompt = f"""
You are an expert business data analyst. 
Interpret this SQL query result in concise, natural language — like how you'd explain it in a meeting. 

**SQL Query:**
{sql}

**Sample of the Data (first 10 rows):**
{sample_data}

### Instructions:
- Write 3–5 sentences max.
- Focus on what the data *means*, not what the SQL does.
- Highlight key insights, rankings, comparisons, or anomalies.
- Be conversational, confident, and insight-driven.
- Do NOT restate column names mechanically or describe SQL steps.
- Avoid markdown headers or numbered steps.
- If numeric patterns are clear, mention approximate magnitudes (e.g. “around $60K”).
"""

        model = genai.GenerativeModel("models/gemini-2.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        return f"(Summary generation failed: {e})"






@app.get("/health")
def health():
    return {"ok": True}

@app.post("/ask", response_model=AskRes)
def ask(req: AskReq):
    try:
                # Use .invoke instead of deprecated __call__
        result = db_chain.invoke({"query": req.query})

        # Handle both old and new output structures
        steps = result.get("intermediate_steps", [])
        sql = ""

        for step in steps:
            if isinstance(step, (list, tuple)) and len(step) == 2:
                tag, content = step
                if str(tag).lower().startswith("sql"):
                    sql = content
            elif isinstance(step, str) and "select" in step.lower():
                sql = step
            elif isinstance(step, dict) and "sql_cmd" in step:
                sql = step["sql_cmd"]

        if not sql:
            raise HTTPException(status_code=500, detail=f"No SQL generated. Steps: {steps}")

        # 🧹 Cleanup markdown fences
        sql = sql.replace("```sql", "").replace("```", "").strip()
        sql = sql.replace("--", "#")  # neutralize comments for safety
        sql = sql.replace("SQL:", "").strip()
        sql = sql.replace("SQLQuery:", "").strip()
        if sql.endswith(";"):
            sql = sql[:-1].strip()
        
        # ✅ Relaxed safety — allow plain SELECT queries even with joins
        if not sql.lower().startswith("select"):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed.")

        #if not is_safe_select(sql):
        #    raise HTTPException(status_code=400, detail="Unsafe SQL generated.")

        #sql = enforce_limit(sql, DEFAULT_LIMIT)

        # Run query safely
        df = pd.read_sql_query(sql, db._engine)

        # 📝 Step 3 — Generate summary
        summary = analyze_results(sql, df)

        return AskRes(
            sql=sql,
            rows=df.to_dict("records"),
            columns=list(df.columns),
            rowcount=len(df),
            summary=summary
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")

@app.post("/ask-raw", response_model=AskRes)
def ask(req: AskReq):
    try:
        result = db_chain.invoke({"query": req.query})

        steps = result.get("intermediate_steps", [])
        sql = ""

        # Extract SQL robustly
        for step in steps:
            if isinstance(step, (list, tuple)) and len(step) == 2:
                tag, content = step
                if "sql" in str(tag).lower():
                    sql = content
            elif isinstance(step, str) and "select" in step.lower():
                sql = step
            elif isinstance(step, dict):
                sql = step.get("sql_cmd") or step.get("sql") or sql

        if not sql:
            raise HTTPException(status_code=500, detail=f"No SQL generated. Steps: {steps}")

        # Clean markdown and comments
        sql = sql.replace("```sql", "").replace("```", "").strip()
        sql = sql.replace("--", "#")  # neutralize comments for safety
        sql = sql.replace("SQL:", "").strip()
        sql = sql.replace("SQLQuery:", "").strip()
        if sql.endswith(";"):
            sql = sql[:-1].strip()

        print("\n\n================ GENERATED SQL ================\n")
        print(sql)
        print("\n==============================================\n")

        # ✅ Instead of hard-blocking, just warn
        if "select" not in sql.lower():
            raise HTTPException(status_code=400, detail=f"Query doesn’t look like SELECT.\nSQL: {sql}")

        #sql = enforce_limit(sql, DEFAULT_LIMIT)

        df = pd.read_sql_query(sql, db._engine)
        return AskRes(sql=sql, rows=df.to_dict("records"),
                      columns=list(df.columns), rowcount=len(df))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {e}")
