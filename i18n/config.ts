export type Locale = (typeof locales)[number];

export const locales = ["en", "zh-TW"] as const;

export const defaultLocale: Locale = "en";

// 语言信息映射
export interface LanguageInfo {
  code: Locale;
  name: string;
  nativeName: string;
}

export const languageMap: Record<Locale, LanguageInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  "zh-TW": {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "繁體中文",
  },
};

// 获取语言信息的辅助函数
export const getLanguageInfo = (locale: Locale): LanguageInfo => {
  return languageMap[locale];
};

// 获取所有支持的语言列表
export const getSupportedLanguages = (): LanguageInfo[] => {
  return locales.map((locale) => languageMap[locale]);
};
