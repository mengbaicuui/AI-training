import pandas as pd

df = pd.read_csv("hf://datasets/Majipa/Cars_details_QA/Cars_details_QA.csv")
# 加一列空 input，满足 Llama Factory Alpaca 的 instruction/input/output
df["input"] = ""
df.to_json("data/Cars_details_QA/train.json", orient="records", lines=True, force_ascii=False)