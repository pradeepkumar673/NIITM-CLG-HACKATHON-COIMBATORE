import yaml
import os
from pathlib import Path

I18N_DIR = Path("config/i18n")
_packs = {}

def load_packs():
    global _packs
    for lang in ["en", "ta", "hi"]:
        path = I18N_DIR / lang / f"{lang}.yaml"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                _packs[lang] = yaml.safe_load(f)

load_packs()

def get_pack(lang: str):
    if lang not in _packs:
        lang = "en"
    return _packs.get(lang, _packs.get("en", {}))

def translate_finding(name: str, lang: str = "en") -> str:
    pack = get_pack(lang)
    en_pack = get_pack("en")
    return pack.get("findings", {}).get(name, en_pack.get("findings", {}).get(name, name))

def translate_tier(tier: str, lang: str = "en") -> str:
    pack = get_pack(lang)
    en_pack = get_pack("en")
    tier_lower = tier.lower()
    return pack.get("tiers", {}).get(tier_lower, en_pack.get("tiers", {}).get(tier_lower, tier))

def get_rationale_template(lang: str = "en") -> str:
    pack = get_pack(lang)
    return pack.get("rationale", {}).get("template", "{p} {zone} {conf} {decision}")

def translate(key_path: str, lang: str = "en") -> str:
    pack = get_pack(lang)
    en_pack = get_pack("en")
    keys = key_path.split('.')
    
    def get_val(p, ks):
        v = p
        for k in ks:
            if not isinstance(v, dict): return None
            v = v.get(k)
        return v
        
    val = get_val(pack, keys)
    if val is None:
        val = get_val(en_pack, keys)
        if val is None: return key_path
        return f"[EN] {val}" # Fallback flag
    return val
