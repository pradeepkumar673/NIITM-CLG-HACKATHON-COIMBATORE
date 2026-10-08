import os
import yaml

with open("config/anatomy.yaml", "r", encoding="utf-8") as f:
    anatomy_cfg = yaml.safe_load(f)

anatomy_en = {}
anatomy_ta = {}
anatomy_hi = {}

for r in anatomy_cfg.get("regions", []):
    anatomy_en[r["id"]] = r.get("label_en", "")
    anatomy_ta[r["id"]] = r.get("label_ta", "")
    anatomy_hi[r["id"]] = r.get("label_hi", "")

en_pack = {
    "metadata": {
        "language": "en",
        "review_status": "reviewed",
        "reviewer": "Dr. A. Sharma"
    },
    "disclaimer": "Decision support only. Not a diagnosis. Requires clinician review.",
    "findings": {
        "Atelectasis": "Atelectasis",
        "Cardiomegaly": "Cardiomegaly",
        "Effusion": "Effusion",
        "Infiltration": "Infiltration",
        "Mass": "Mass",
        "Nodule": "Nodule",
        "Pneumonia": "Pneumonia",
        "Pneumothorax": "Pneumothorax",
        "Consolidation": "Consolidation",
        "Edema": "Edema",
        "Emphysema": "Emphysema",
        "Fibrosis": "Fibrosis",
        "Pleural_Thickening": "Pleural Thickening",
        "Hernia": "Hernia",
        "fracture": "Fracture",
        "knee_normal": "Knee (Normal)",
        "knee_abnormal": "Knee (Abnormal)",
        "tb": "Tuberculosis"
    },
    "anatomy": anatomy_en,
    "tiers": {
        "high": "High",
        "medium": "Medium",
        "low": "Low",
        "unreliable": "Unreliable Artifact"
    },
    "review_banners": {
        "needs_human_review": "Needs human review",
        "machine_drafted": "Machine-drafted translation; not reviewed by a clinician"
    },
    "rationale": {
        "template": "Based on {p} probability in zone {zone} with {conf}% confidence, {decision}."
    },
    "quality_warnings": {
        "image_rejected": "Image rejected: Quality check failed."
    },
    "triage": {
        "immediate": "Immediate",
        "urgent": "Urgent",
        "routine": "Routine"
    },
    "labels": {
        "exploratory": "EXPLORATORY",
        "experimental": "EXPERIMENTAL"
    }
}

ta_pack = {
    "metadata": {
        "language": "ta",
        "review_status": "machine_drafted",
        "reviewer": None
    },
    "disclaimer": "முடிவு ஆதரவு மட்டுமே. நோய் கண்டறிதல் அல்ல. மருத்துவர் ஆய்வு தேவை.",
    "findings": {
        "Atelectasis": "நுரையீரல் சுருக்கம் (Atelectasis)",
        "Cardiomegaly": "இதய வீக்கம் (Cardiomegaly)",
        "Effusion": "நீர் கோர்த்தல் (Effusion)",
        "Infiltration": "ஊடுருவல் (Infiltration)",
        "Mass": "கட்டி (Mass)",
        "Nodule": "சிறுகட்டி (Nodule)",
        "Pneumonia": "நிமோனியா",
        "Pneumothorax": "மார்பகக் காற்று (Pneumothorax)",
        "Consolidation": "கெட்டியாதல் (Consolidation)",
        "Edema": "நீர்க்கட்டு (Edema)",
        "Emphysema": "எம்பிசிமா",
        "Fibrosis": "நார்ச்சத்துக் கட்டிகள் (Fibrosis)",
        "Pleural_Thickening": "ப்ளூரல் தடிமன்",
        "Hernia": "குடலிறக்கம் (Hernia)",
        "fracture": "எலும்பு முறிவு",
        "knee_normal": "முழங்கால் (சாதாரண)",
        "knee_abnormal": "முழங்கால் (அசாதாரண)",
        "tb": "காசநோய் (TB)"
    },
    "anatomy": anatomy_ta,
    "tiers": {
        "high": "உயர்",
        "medium": "நடுத்தர",
        "low": "குறைந்த",
        "unreliable": "நம்பகமற்ற செயற்கைப் பொருள்"
    },
    "review_banners": {
        "needs_human_review": "மனித ஆய்வு தேவை",
        "machine_drafted": "இயந்திரத்தால் வரைவு செய்யப்பட்ட மொழிபெயர்ப்பு; மருத்துவக் குழுவால் மதிப்பாய்வு செய்யப்படவில்லை"
    },
    "rationale": {
        "template": "{zone} மண்டலத்தில் {p} நிகழ்தகவு மற்றும் {conf}% நம்பிக்கையுடன், {decision}."
    },
    "quality_warnings": {
        "image_rejected": "படம் நிராகரிக்கப்பட்டது: தரச் சோதனை தோல்வியடைந்தது."
    },
    "triage": {
        "immediate": "உடனடி",
        "urgent": "அவசரம்",
        "routine": "வழக்கமான"
    },
    "labels": {
        "exploratory": "ஆராய்ச்சிக்குரிய (EXPLORATORY)",
        "experimental": "பரிசோதனைக்குரிய (EXPERIMENTAL)"
    }
}

hi_pack = {
    "metadata": {
        "language": "hi",
        "review_status": "machine_drafted",
        "reviewer": None
    },
    "disclaimer": "केवल निर्णय समर्थन। निदान नहीं। चिकित्सक की समीक्षा आवश्यक है।",
    "findings": {
        "Atelectasis": "एटिलेक्टासिस",
        "Cardiomegaly": "कार्डियोमेगेली (हृदय का बढ़ना)",
        "Effusion": "इफ्यूजन",
        "Infiltration": "इनफिल्ट्रेशन",
        "Mass": "द्रव्यमान (Mass)",
        "Nodule": "गांठ (Nodule)",
        "Pneumonia": "निमोनिया",
        "Pneumothorax": "न्यूमोथोरैक्स",
        "Consolidation": "कंसोलिडेशन",
        "Edema": "एडिमा (सूजन)",
        "Emphysema": "एम्फिसीमा",
        "Fibrosis": "फाइब्रोसिस",
        "Pleural_Thickening": "फुफ्फुस का मोटा होना",
        "Hernia": "हर्निया",
        "fracture": "फ्रैक्चर (हड्डी टूटना)",
        "knee_normal": "घुटना (सामान्य)",
        "knee_abnormal": "घुटना (असामान्य)",
        "tb": "क्षय रोग (TB)"
    },
    "anatomy": anatomy_hi,
    "tiers": {
        "high": "उच्च",
        "medium": "मध्यम",
        "low": "निम्न",
        "unreliable": "अविश्वसनीय आर्टिफैक्ट"
    },
    "review_banners": {
        "needs_human_review": "मानव समीक्षा की आवश्यकता है",
        "machine_drafted": "मशीन-ड्राफ्टेड अनुवाद; किसी चिकित्सक द्वारा समीक्षा नहीं की गई"
    },
    "rationale": {
        "template": "ज़ोन {zone} में {p} संभावना और {conf}% विश्वास के आधार पर, {decision}।"
    },
    "quality_warnings": {
        "image_rejected": "छवि अस्वीकृत: गुणवत्ता जांच विफल।"
    },
    "triage": {
        "immediate": "तत्काल",
        "urgent": "जरूरी",
        "routine": "नियमित"
    },
    "labels": {
        "exploratory": "खोजपूर्ण (EXPLORATORY)",
        "experimental": "प्रायोगिक (EXPERIMENTAL)"
    }
}

def save_pack(name, data):
    dir_path = f"config/i18n/{name}"
    os.makedirs(dir_path, exist_ok=True)
    with open(f"{dir_path}/{name}.yaml", "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)

os.makedirs("config/i18n", exist_ok=True)
save_pack("en", en_pack)
save_pack("ta", ta_pack)
save_pack("hi", hi_pack)
print("Language packs generated.")
