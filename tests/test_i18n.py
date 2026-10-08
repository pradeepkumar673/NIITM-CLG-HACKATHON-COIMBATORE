import os
import yaml
import re

def load_pack(lang):
    with open(f"config/i18n/{lang}/{lang}.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def test_i18n_keys():
    en = load_pack("en")
    ta = load_pack("ta")
    hi = load_pack("hi")
    
    def check_keys(d_en, d_other, path=""):
        for k, v in d_en.items():
            if k == "metadata": continue
            assert k in d_other, f"Missing key {path}.{k} in translation pack"
            if isinstance(v, dict):
                check_keys(v, d_other[k], path=f"{path}.{k}")
    
    check_keys(en, ta)
    check_keys(en, hi)

def test_i18n_placeholders():
    en = load_pack("en")
    ta = load_pack("ta")
    hi = load_pack("hi")
    
    def get_placeholders(text):
        return set(re.findall(r"\{.*?\}", text))
    
    en_template = en["rationale"]["template"]
    en_ph = get_placeholders(en_template)
    
    ta_ph = get_placeholders(ta["rationale"]["template"])
    hi_ph = get_placeholders(hi["rationale"]["template"])
    
    assert en_ph == ta_ph, f"Placeholders mismatch in Tamil: expected {en_ph}, got {ta_ph}"
    assert en_ph == hi_ph, f"Placeholders mismatch in Hindi: expected {en_ph}, got {hi_ph}"
