from pathlib import Path
from datetime import datetime, date
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tratamento import tratar_dados
from geografia import adicionar_geografia
from banco import consultar_visitas

app = FastAPI(title="FESA Geo Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)
ARQUIVO = Path(__file__).parent / "dados" / "Pasta1.xlsx"

CAMPOS = {
    "Id": "id",
    "data_visita": "date",
    "Ano": "year",
    "Núm. Semana": "week",
    "nm_Semestre": "semester",
    "AccountId": "accountId",
    "Account": "accountName",
    "ActivityCategory": "activityCategory",
    "Status": "status",
    "UsrPais": "country",
    "state": "state",
    "nomeresponsavelvisita": "responsibleName","commercialRegion": "commercialRegion",
    "locationName": "locationName",
    "geoPrecision": "geoPrecision",
}

@app.get("/api/visits")
def get_visits():
    df = consultar_visitas()
    
    df.columns = df.columns.str.strip()

    df = tratar_dados(df)
    df = adicionar_geografia(df)

    df = df.rename(columns=CAMPOS)

    colunas_saida = list(CAMPOS.values()) + ["city", "location"]
    df = df.loc[:, colunas_saida].copy()

    df["date"] = pd.to_datetime(
        df["date"], errors="coerce", format="%Y-%m-%d"
    ).dt.strftime("%Y-%m-%d")

    for campo in ["id", "accountId"]:
        df[campo] = df[campo].astype("string")

    df = df.astype(object).where(pd.notna(df), None)

    registros = df.to_dict(orient="records")

    for i, registro in enumerate(registros):
        registro["id"] = str(registro["id"] or f"linha-{i+2}")
        registro["date"] = registro["date"] or ""
        registro["accountName"] = registro["accountName"] or ""

    return {"data": registros}
