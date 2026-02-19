import { UI_STRINGS } from './constants';

export const t = (selectedLanguage, key, subKey = null) => {
  const langMap = {
    "English (EN)": "EN",
    "日本語 (JA)": "JA",
    "ไทย (TH)": "TH",
    "Bahasa Indonesia (ID)": "ID",
    "한국어 (KO)": "KO",
    "中文 (ZH)": "ZH",
    "Tiếng Việt (VI)": "VI"
  };
  
  const langCode = langMap[selectedLanguage] || "EN";
  let val = UI_STRINGS[langCode]?.[key];
  
  if (subKey && val) {
    val = val[subKey];
  }
  
  if (typeof val === 'string') return val;
  return subKey || key; 
};
