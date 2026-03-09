import type { Locale, LocaleData } from './types';
import { LOCALE_ALIAS } from './types';

export class I18n {
  private static currentLocale: Locale = 'enUS';
  private static data: Map<Locale, LocaleData> = new Map();

  static setLocale(locale: string): void {
    // Map short locale to full locale
    const mapped = LOCALE_ALIAS[locale] || locale as Locale;
    this.currentLocale = mapped;
  }

  static getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Load locale data directly (for browser/demo use)
   */
  static loadLocale(data: LocaleData): void {
    this.data.set(data.locale, data);
    this.currentLocale = data.locale;
  }

  static loadFromXml(xmlCards: Map<string, {
    name: Record<string, string>;
    description: Record<string, string>;
  }>, locale: Locale): void {
    const cardNames: Record<string, string> = {};
    const cardDescriptions: Record<string, string> = {};

    for (const [cardId, cardData] of xmlCards) {
      if (cardData.name[locale]) {
        cardNames[cardId] = cardData.name[locale];
      }
      if (cardData.description[locale]) {
        cardDescriptions[cardId] = cardData.description[locale];
      }
    }

    // Store in data map
    const existingData = this.data.get(locale) || {
      locale,
      cardNames: {},
      cardDescriptions: {},
      gameTexts: {},
      errorMessages: {},
      logMessages: {},
    };

    // Merge new data
    Object.assign(existingData.cardNames, cardNames);
    Object.assign(existingData.cardDescriptions, cardDescriptions);
    this.data.set(locale, existingData);
  }

  static getCardName(cardId: string): string {
    // Try current locale first
    let localeData = this.data.get(this.currentLocale);
    if (localeData?.cardNames[cardId]) {
      return localeData.cardNames[cardId];
    }

    // Fallback to enUS
    if (this.currentLocale !== 'enUS') {
      localeData = this.data.get('enUS');
      if (localeData?.cardNames[cardId]) {
        return localeData.cardNames[cardId];
      }
    }

    return cardId;
  }

  static getCardDescription(cardId: string): string {
    // Try current locale first
    let localeData = this.data.get(this.currentLocale);
    if (localeData?.cardDescriptions[cardId]) {
      return localeData.cardDescriptions[cardId];
    }

    // Fallback to enUS
    if (this.currentLocale !== 'enUS') {
      localeData = this.data.get('enUS');
      if (localeData?.cardDescriptions[cardId]) {
        return localeData.cardDescriptions[cardId];
      }
    }

    return '';
  }

  static t(key: string, params?: Record<string, unknown>): string {
    const localeData = this.data.get(this.currentLocale);
    let template =
      localeData?.gameTexts[key] ||
      localeData?.errorMessages[key] ||
      key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return template;
  }

  static log(key: string, ...args: unknown[]): string {
    const localeData = this.data.get(this.currentLocale);
    const template = localeData?.logMessages[key] || key;
    return this.format(template, ...args);
  }

  private static format(template: string, ...args: unknown[]): string {
    let i = 0;
    return template.replace(/%[sd]/g, () => String(args[i++]));
  }
}

export const t = I18n.t.bind(I18n);
export const getCardName = I18n.getCardName.bind(I18n);
export const getCardDescription = I18n.getCardDescription.bind(I18n);
export type { Locale, LocaleData } from './types';
