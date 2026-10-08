import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app": {
        "title": "X-Ray Assistant"
      },
      "signoff": {
        "title": "Review Sign-off",
        "findings": "Findings",
        "interactions": "Interactions",
        "download_pdf": "Download PDF Report",
        "agree": "Agree",
        "disagree": "Disagree",
        "needs_more": "Needs more imaging",
        "notes": "Notes",
        "submit": "Submit Review"
      },
      "dashboard": {
        "title": "Admin Dashboard",
        "users": "Users & Clinics",
        "models": "Edge Models"
      }
    }
  },
  ta: {
    translation: {
      "app": {
        "title": "எக்ஸ்ரே உதவியாளர் (X-Ray Assistant)"
      },
      "signoff": {
        "title": "மதிப்பாய்வு கையொப்பம்",
        "findings": "கண்டுபிடிப்புகள்",
        "interactions": "தொடர்புகள்",
        "download_pdf": "PDF அறிக்கை பதிவிறக்கு",
        "agree": "ஏற்கிறேன்",
        "disagree": "ஏற்கவில்லை",
        "needs_more": "மேலும் படங்கள் தேவை",
        "notes": "குறிப்புகள்",
        "submit": "சமர்ப்பி"
      },
      "dashboard": {
        "title": "நிர்வாகி டாஷ்போர்டு",
        "users": "பயனர்கள் & கிளினிக்குகள்",
        "models": "எட்ஜ் மாடல்கள்"
      }
    }
  },
  hi: {
    translation: {
      "app": {
        "title": "एक्स-रे सहायक (X-Ray Assistant)"
      },
      "signoff": {
        "title": "समीक्षा साइन-ऑफ",
        "findings": "निष्कर्ष",
        "interactions": "परस्पर क्रिया",
        "download_pdf": "PDF रिपोर्ट डाउनलोड करें",
        "agree": "सहमत",
        "disagree": "असहमत",
        "needs_more": "अधिक इमेजिंग की आवश्यकता",
        "notes": "टिप्पणियाँ",
        "submit": "समीक्षा सबमिट करें"
      },
      "dashboard": {
        "title": "व्यवस्थापक डैशबोर्ड",
        "users": "उपयोगकर्ता और क्लीनिक",
        "models": "एज मॉडल"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
