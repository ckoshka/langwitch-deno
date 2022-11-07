import limax from "npm:limax";

export const transliterateLimax = (lang: string | undefined) => (s: string): string => limax(s, {separator: " ", maintainCase: false, lang});