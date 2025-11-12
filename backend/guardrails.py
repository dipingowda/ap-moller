import sqlparse , re

FORBIDDEN = re.compile(r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|ATTACH|PRAGMA|COPY)\b", re.I)
WHITELIST = {
        "customers","orders","order_items","products","payments","reviews",
        "product_category_translation", "sellers" , "geolocation",
        "geolocation_agg","customers_geo","orders_enriched","order_items_enriched", "payments_agg"
}

def is_safe_select(sql: str) -> bool:
    parsed = sqlparse.parse(sql)
    if len(parsed) != 1: return False
    if parsed[0].get_type() != "SELECT": return False
    if FORBIDDEN.search(sql): return False
    low = sql.lower()
    return any(f" {t} " in low or f"{t}." in low or f" {t}\n" in low for t in WHITELIST)

def enforce_limit(sql: str, default_limit: int) -> str:
    low = sql.lower()
    if " limit " in low: return sql.strip().rstrip(";") + ";"
    return sql.strip().rstrip(";") + f" LIMIT {default_limit};"