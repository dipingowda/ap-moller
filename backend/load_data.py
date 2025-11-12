import os
import duckdb
import pandas as pd

DB_PATH = os.getenv("DUCKDB_PATH", "olist.duckdb")

TABLES = {
    "customers": "olist_customers_dataset.csv",
    "orders": "olist_orders_dataset.csv",
    "order_items": "olist_order_items_dataset.csv",
    "products": "olist_products_dataset.csv",
    "payments": "olist_order_payments_dataset.csv",
    "reviews": "olist_order_reviews_dataset.csv",
    "product_category_translation": "product_category_name_translation.csv",
    "sellers": "olist_sellers_dataset.csv",
    "geolocation": "olist_geolocation_dataset.csv",
}

DATE_COLS = {
    "orders": [
        "order_purchase_timestamp",
        "order_approved_at",
        "order_delivered_carrier_date",
        "order_delivered_customer_date",
        "order_estimated_delivery_date",
    ],
    "order_items": ["shipping_limit_date"],
    "reviews": ["review_creation_date", "review_answer_timestamp"],
}

def read_csv(path: str, table: str) -> pd.DataFrame:
    if table in DATE_COLS:
        return pd.read_csv(path, parse_dates=DATE_COLS[table], low_memory=False)
    return pd.read_csv(path, low_memory=False)

def main():
    con = duckdb.connect(DB_PATH)
    

    # 1) Base tables
    for t, f in TABLES.items():
        df = read_csv(f"data/{f}", t)
        con.execute(f"CREATE OR REPLACE TABLE {t} AS SELECT * FROM df")

    # 2) Geo aggregate (one row per ZIP)
    con.execute("""
        CREATE OR REPLACE VIEW geolocation_agg AS
        SELECT
          geolocation_zip_code_prefix AS zip_prefix,
          AVG(geolocation_lat) AS lat,
          AVG(geolocation_lng) AS lng,
          arbitrary(geolocation_city)  AS sample_city,
          arbitrary(geolocation_state) AS sample_state
        FROM geolocation
        GROUP BY 1
    """)

    # 3) Customers + geo
    con.execute("""
        CREATE OR REPLACE VIEW customers_geo AS
        SELECT
          c.*,
          g.lat, g.lng,
          g.sample_city  AS geo_city,
          g.sample_state AS geo_state
        FROM customers c
        LEFT JOIN geolocation_agg g
          ON c.customer_zip_code_prefix = g.zip_prefix
    """)

    # 4) Orders enriched (customer + geo)  ← keep only this final version
    con.execute("""
        CREATE OR REPLACE VIEW orders_enriched AS
        SELECT
          o.*,
          c.customer_unique_id,
          c.customer_city,
          c.customer_state,
          cg.lat AS customer_lat,
          cg.lng AS customer_lng
        FROM orders o
        LEFT JOIN customers c   ON o.customer_id = c.customer_id
        LEFT JOIN customers_geo cg ON c.customer_id = cg.customer_id
    """)

    # 5) Order items enriched (category EN + seller)  ← keep only this final version
    con.execute("""
        CREATE OR REPLACE VIEW order_items_enriched AS
        SELECT
          oi.*,
          p.product_category_name,
          pct.product_category_name_english AS product_category_name_en,
          s.seller_city,
          s.seller_state
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN product_category_translation pct
               ON p.product_category_name = pct.product_category_name
        LEFT JOIN sellers s ON oi.seller_id = s.seller_id
    """)

    # 6) Payments aggregate per order (useful for GMV/AOV)
    con.execute("""
        CREATE OR REPLACE VIEW payments_agg AS
        SELECT
          order_id,
          SUM(payment_value) AS payment_value_sum,
          COUNT(*) AS payment_rows
        FROM payments
        GROUP BY 1
    """)

    con.close()
    print("DuckDB ready at", DB_PATH)

if __name__ == "__main__":
    main()
