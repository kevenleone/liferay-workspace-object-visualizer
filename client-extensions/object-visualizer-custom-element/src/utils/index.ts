import { Liferay } from '@/lib/liferay';

export function getAbbreviation(text: string) {
    return text.substring(0, 4);
}

export function getLocalizedField(field?: { [key: string]: string }) {
    if (!field) {
        return '';
    }

    return field[Liferay.ThemeDisplay.getBCP47LanguageId()] ?? field.en_US;
}
