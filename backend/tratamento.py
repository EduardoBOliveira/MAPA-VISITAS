
import re
import unicodedata
import pandas as pd


def texto_valido(valor):
    """Limpa valores vazios ou códigos inválidos."""
    if pd.isna(valor):
        return None

    texto = str(valor).strip()

    if texto.lower() in {"", "20", "nan", "none", "null"}:
        return None

    return " ".join(texto.split())


def chave(texto):
    """Normaliza texto apenas para comparação."""
    if not texto:
        return ""

    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(
        c for c in texto if not unicodedata.combining(c)
    )
    return texto.casefold().strip()


def tratar_localizacao(valor):
    """
    Preserva a classificação oficial da FESA.
    Extrai a sigla comercial entre parênteses.
    """
    original = texto_valido(valor)

    if not original:
        return {
            "location": None,
            "commercialRegion": None,
            "locationName": None,
        }

    resultado = re.match(
        r"^(.*?)\s*\(([^()]*)\)\s*$",
        original
    )

    if resultado:
        nome = resultado.group(1).strip()
        regiao = resultado.group(2).strip().upper()

        return {
            "location": original,
            "commercialRegion": regiao or None,
            "locationName": nome or None,
        }

    return {
        "location": original,
        "commercialRegion": None,
        "locationName": original,
    }


def tratar_cidade(valor):
    """Preserva a cidade, sem inventar coordenadas."""
    cidade = texto_valido(valor)

    if not cidade:
        return None

    # Impede que nomes de estados sejam tratados
    # automaticamente como municípios.
    estados = {
        "acre", "alagoas", "amapa", "amazonas",
        "bahia", "ceara", "distrito federal",
        "espirito santo", "goias", "maranhao",
        "mato grosso", "mato grosso do sul",
        "minas gerais", "para", "paraiba",
        "parana", "pernambuco", "piaui",
        "rio de janeiro", "rio grande do norte",
        "rio grande do sul", "rondonia",
        "roraima", "santa catarina",
        "sao paulo", "sergipe", "tocantins",
    }

    siglas = {
        "AC", "AL", "AP", "AM", "BA", "CE",
        "DF", "ES", "GO", "MA", "MT", "MS",
        "MG", "PA", "PB", "PR", "PE", "PI",
        "RJ", "RN", "RS", "RO", "RR", "SC",
        "SP", "SE", "TO",
    }

    if chave(cidade) in estados or cidade.upper() in siglas:
        return None

    return cidade


def tratar_dados(df):
    """Aplica o tratamento sem alterar o Excel original."""
    df = df.copy()

    for coluna in ["UsrLocalizacao", "UsrCidade"]:
        if coluna not in df.columns:
            df[coluna] = None

    localizacoes = df["UsrLocalizacao"].apply(
        tratar_localizacao
    )

    df["location"] = localizacoes.apply(
        lambda x: x["location"]
    )

    df["commercialRegion"] = localizacoes.apply(
        lambda x: x["commercialRegion"]
    )

    df["locationName"] = localizacoes.apply(
        lambda x: x["locationName"]
    )

    df["city"] = df["UsrCidade"].apply(tratar_cidade)

    df["geoPrecision"] = df.apply(
        lambda linha: (
            "city_unverified"
            if pd.notna(linha["city"]) and bool(linha["city"])
            else "commercial_location"
            if pd.notna(linha["location"]) and bool(linha["location"])
            else "unknown"
        ),
        axis=1
    )

    return df

if __name__ == "__main__":
    from pathlib import Path

    arquivo = Path(__file__).parent / "dados" / "Pasta1.xlsx"
    df = pd.read_excel(arquivo)

    resultado = tratar_dados(df)

    print(resultado[
        ["UsrLocalizacao", "locationName",
         "commercialRegion", "city", "geoPrecision"]
    ].head(15).to_string(index=False))

    print("\nClassificação geográfica:")
    print(resultado["geoPrecision"].value_counts())