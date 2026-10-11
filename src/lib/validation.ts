import { australianCities } from "@/data/australianCities";

export type RegistrationInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

export type FieldName = keyof RegistrationInput;
export type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Australian numbers: 04xx xxx xxx, (02) 9xxx xxxx, +61 4xx xxx xxx …
const AU_PHONE_RE = /^(?:\+?61|0)[2-478]\d{8}$/;

const CITY_SET = new Set(australianCities.flatMap((g) => g.cities));

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s()-]/g, "");
}

/** Returns a cleaned copy of the input (trimmed strings, lower-cased email). */
export function normalizeRegistration(input: RegistrationInput): RegistrationInput {
  return {
    name: input.name.trim().replace(/\s+/g, " "),
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    city: input.city.trim(),
  };
}

export function validateRegistration(values: RegistrationInput): FieldErrors {
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Please enter your full name.";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters.";
  else if (name.length > 80) errors.name = "Name is too long.";
  else if (!/^[a-zA-Z\s.'-]+$/.test(name))
    errors.name = "Only letters, spaces, apostrophes and hyphens are allowed.";

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > 254 || !EMAIL_RE.test(email))
    errors.email = "That email address doesn't look right.";

  const phone = normalizePhone(values.phone);
  if (!phone) errors.phone = "Please enter your phone number.";
  else if (!AU_PHONE_RE.test(phone))
    errors.phone = "Enter a valid Australian number, e.g. 0434 286 892.";

  if (!values.city) errors.city = "Please select your city.";
  else if (!CITY_SET.has(values.city)) errors.city = "Please choose a city from the list.";

  return errors;
}

export function stateForCity(city: string): string {
  return australianCities.find((g) => g.cities.includes(city))?.state ?? "";
}
