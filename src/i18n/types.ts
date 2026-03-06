export type Locale =
  | 'enUS' | 'enGB'
  | 'zhCN' | 'zhTW'
  | 'deDE' | 'esES' | 'esMX'
  | 'frFR' | 'itIT'
  | 'jaJP' | 'koKR'
  | 'plPL' | 'ptBR'
  | 'ruRU' | 'thTH';

// Short locale codes for internal use
export const LOCALE_ALIAS: Record<string, Locale> = {
  'en': 'enUS',
  'zh': 'zhCN',
  'zh-CN': 'zhCN',
  'zh-TW': 'zhTW',
};

export interface LocaleData {
  locale: Locale;
  cardNames: Record<string, string>;
  cardDescriptions: Record<string, string>;
  gameTexts: Record<string, string>;
  errorMessages: Record<string, string>;
  logMessages: Record<string, string>;
}
