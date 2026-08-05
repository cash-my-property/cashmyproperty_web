import { content as en } from './en';
import { content as ar } from './ar';

export const dictionaries = {
  en,
  ar,
};

export type Locale = keyof typeof dictionaries;
