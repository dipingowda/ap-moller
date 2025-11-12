import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load your .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("❌ GEMINI_API_KEY not found in environment!")

genai.configure(api_key=api_key)

print("🔍 Fetching available Gemini models for this API key...\n")

models = genai.list_models()

for m in models:
    print(f"Model ID: {m.name}")
    print(f"Supported methods: {getattr(m, 'supported_generation_methods', [])}")
    print(f"  Description: {getattr(m, 'description', '')}")
    print("-" * 80)
print("\n✅ Done!")