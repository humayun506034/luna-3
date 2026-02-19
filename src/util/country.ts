import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

export const getCountryNameFromNumber = (phone: string) => {
  try {
    if (!phone) return null;

    const parsed = parsePhoneNumberFromString(phone);

    if (!parsed || !parsed.country) return null;

    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    return regionNames.of(parsed.country) || null;
  } catch {
    return null;
  }
};
