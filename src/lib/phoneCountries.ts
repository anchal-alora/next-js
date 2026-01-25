import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

export type PhoneCountryOption = {
  country: CountryCode;
  countryName: string;
  callingCode: string;
  label: string;
};

export function getCallingCodeForCountry(country: CountryCode): string {
  return `+${getCountryCallingCode(country)}`;
}

export function getPhoneCountryOptions(locale = "en"): PhoneCountryOption[] {
  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames([locale], { type: "region" })
      : null;

  return getCountries()
    .map((country) => {
      const countryName = displayNames?.of(country) ?? country;
      const callingCode = getCallingCodeForCountry(country);
      return {
        country,
        countryName,
        callingCode,
        label: `${countryName} (${callingCode})`,
      };
    })
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
}
