import pandas as pd

df = pd.read_excel(
    "data/GREYC-NISLABKeystrokeBenchmarkDatasetSyed.xlsx",
    sheet_name="P5"
)

vector = list(
    map(
        int,
        df.iloc[0]["Keystroke Template Vector"].split()
    )
)

print("Length:", len(vector))
print(vector)