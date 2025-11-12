from rapidfuzz import fuzz, process
import duckdb
import pandas as pd
import os
import json

DB_PATH = os.getenv("DUCKDB_PATH", "olist.duckdb")



import duckdb
import json
from datetime import datetime
from rapidfuzz import fuzz, process


