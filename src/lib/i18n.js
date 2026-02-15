import { UI_STRINGS } from './constants';

export const t = (selectedLanguage, key, subKey = null) => {
  const langMap = {
    "English": "EN",
    "日本語": "JA",
    "ไทย": "TH",
    "Bahasa Indonesia": "ID",
    "한국어": "KO",
    "中文": "ZH"
  };
  
  const langCode = langMap[selectedLanguage] || "EN";
  let val = UI_STRINGS[langCode]?.[key];
  
  if (subKey && val) {
    val = val[subKey];
  }
  
  if (typeof val === 'string') return val;
  return subKey || key; 
};
