
from tratamento import chave, texto_valido


# Mapeamento das localizações comerciais da FESA
# para as unidades federativas brasileiras.
LOCALIZACOES_FESA = {
    "sao paulo capital": "SP",
    "sao paulo interior": "SP",
    "grande sao paulo": "SP",
    "sao paulo litoral": "SP",
    "minas gerais": "MG",
    "goias": "GO",
    "mato grosso": "MT",
    "rio de janeiro": "RJ",
    "parana": "PR",
    "distrito federal": "DF",
    "pernambuco": "PE",
    "mato grosso do sul": "MS",
    "santa catarina": "SC",
    "para": "PA",
    "ceara": "CE",
    "rio grande do sul": "RS",
    "amazonas": "AM",
    "espirito santo": "ES",
    "bahia": "BA",
    "tocantins": "TO",
    "acre": "AC",
    "sergipe": "SE",
    "roraima": "RR",
}


def identificar_estado(location_name):
    """
    Identifica a UF pela localização comercial.

    Não utiliza UsrEstado.
    Não modifica a classificação comercial da FESA.
    """
    nome = texto_valido(location_name)

    if not nome:
        return None

    return LOCALIZACOES_FESA.get(chave(nome))


def adicionar_geografia(df):
    """
    Adiciona o estado identificado aos dados tratados.
    Preserva as informações comerciais originais.
    """
    df = df.copy()

    df["state"] = df["locationName"].apply(
        identificar_estado
    )

    return df


if __name__ == "__main__":
    from pathlib import Path
    import pandas as pd
    from tratamento import tratar_dados

    arquivo = Path(__file__).parent / "dados" / "Pasta1.xlsx"

    df = pd.read_excel(arquivo)
    df = tratar_dados(df)
    df = adicionar_geografia(df)

    print("\nVISITAS POR ESTADO:")
    print(
        df["state"]
        .value_counts(dropna=False)
        .to_string()
    )

    print("\nLOCALIZACOES SEM ESTADO IDENTIFICADO:")
    print(
        df.loc[df["state"].isna(), "location"]
        .value_counts(dropna=False)
        .to_string()
    )
