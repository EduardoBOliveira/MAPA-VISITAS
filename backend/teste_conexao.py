
import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

try:
    with psycopg.connect(
        host=os.environ["DB_HOST"],
        port=os.getenv("DB_PORT", "5432"),
        dbname=os.environ["DB_NAME"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        sslmode=os.getenv("DB_SSLMODE", "require"),
        connect_timeout=10,
    ) as conexao:

        print("Conectado ao PostgreSQL da FESA!", flush=True)
        print("Executando consulta de visitas...", flush=True)

        with conexao.cursor() as cursor:
            cursor.execute("SET statement_timeout = '120s'")

            cursor.execute("""
                SELECT COUNT(*)
                FROM "fesa-datalake-ods"."Ft_Com_KPI_Lista_Visitas_Estados" AS v
                INNER JOIN "fesa-datalake-ods"."Ft_Com_KPI_Lista_Visitas_Realizadas" AS f
                    ON v."Id" = f.idvisita
            """)

            
            cursor.execute("""
                SELECT
                    v.data_visita,
                    v."Núm. Semana",
                    v."Ano",
                    v."nm_Semestre",
                    v."Id",
                    v."AccountId",
                    v."Account",
                    v."ActivityCategory",
                    v."Status",
                    v."UsrPais",
                    v."UsrEstado",
                    v."UsrCidade",
                    v."UsrLocalizacao",
                    f.nomeresponsavelvisita
                FROM "fesa-datalake-ods"."Ft_Com_KPI_Lista_Visitas_Estados" AS v
                INNER JOIN "fesa-datalake-ods"."Ft_Com_KPI_Lista_Visitas_Realizadas" AS f
                    ON v."Id" = f.idvisita
            """)

            import pandas as pd

            colunas = [col.name for col in cursor.description]
            df = pd.DataFrame(cursor.fetchall(), columns=colunas)

            print(f"Registros extraídos: {len(df)}")
            print(f"Colunas encontradas: {list(df.columns)}")
            print("Extração concluída com sucesso!")


except Exception as erro:
    print(f"Erro na consulta: {erro}")
