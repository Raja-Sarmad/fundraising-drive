"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { australianCities } from "@/data/australianCities";
import { submitRegistration } from "@/app/actions/registration";
import {
  validateRegistration as validate,
  type FieldErrors as FormErrors,
  type FieldName,
  type RegistrationInput as FormValues,
} from "@/lib/validation";

const initialValues: FormValues = { name: "", email: "", phone: "", city: "" };

/* ───────────── Icons ───────────── */

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const UserIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const PinIcon = () => (
  <svg {...iconProps} className="h-5 w-5">
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const AlertIcon = () => (
  <svg {...iconProps} className="h-4 w-4 shrink-0" strokeWidth={2.2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5M12 16h.01" />
  </svg>
);
const CheckIcon = ({ className }: { className?: string }) => (
  <svg {...iconProps} className={className} strokeWidth={2.6}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ───────────── Field wrapper ───────────── */

function Field({
  id,
  label,
  error,
  icon,
  children,
}: {
  id: FieldName;
  label: string;
  error?: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-bold uppercase tracking-wider text-navy"
      >
        {label} <span className="text-brand-red">*</span>
      </label>
      <div className="group relative">
        <span
          className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${
            error ? "text-brand-red" : "text-slate-400 group-focus-within:text-navy"
          }`}
        >
          {icon}
        </span>
        {children}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-brand-red"
        >
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}

const baseInput =
  "peer block w-full rounded-2xl border-2 bg-slate-50 py-3.5 pl-12 pr-4 text-base font-medium text-navy placeholder:font-normal placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:ring-4";

const inputState = (hasError: boolean) =>
  hasError
    ? "border-brand-red/70 focus:border-brand-red focus:ring-brand-red/15"
    : "border-slate-200 hover:border-slate-300 focus:border-navy focus:ring-navy/15";

/* ───────────── Form ───────────── */

export default function FundraisingForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const shown = (field: FieldName) => (touched[field] ? errors[field] : undefined);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value } as FormValues;
    setValues(next);
    if (touched[name as FieldName]) setErrors(validate(next));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as FieldName;
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, phone: true, city: true });

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setServerError(null);
    setStatus("submitting");

    try {
      // Server Action: validates again → saves to MongoDB → appends to Google Sheet.
      const result = await submitRegistration(values);

      if (result.ok) {
        setStatus("success");
        return;
      }

      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        const first = Object.keys(result.fieldErrors)[0];
        if (first) document.getElementById(first)?.focus();
      }
      setServerError(result.message);
      setStatus("idle");
    } catch (err) {
      console.error("Submission failed:", err);
      setServerError("Something went wrong while submitting. Please check your connection and try again.");
      setStatus("idle");
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setServerError(null);
    setStatus("idle");
  };

  /* ── Success state ── */
  if (status === "success") {
    const firstName = values.name.trim().split(/\s+/)[0];
    return (
      <div role="status" aria-live="polite" className="flex flex-col items-center text-center">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30 [animation-iteration-count:3]" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/40">
            <CheckIcon className="h-10 w-10" />
          </span>
        </div>
        <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Thank you, {firstName}!
        </h3>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-slate-600">
          Your details have been received. We&apos;ll be in touch at{" "}
          <span className="font-bold text-navy">{values.email}</span>.
        </p>

        <dl className="mt-7 w-full overflow-hidden rounded-2xl border border-slate-200 text-left">
          {(
            [
              ["Name", values.name.trim()],
              ["Email", values.email.trim()],
              ["Phone", values.phone.trim()],
              ["City", values.city],
            ] as const
          ).map(([label, value], i) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-4 px-5 py-3 ${
                i % 2 ? "bg-white" : "bg-slate-50"
              }`}
            >
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {label}
              </dt>
              <dd className="truncate text-[15px] font-bold text-navy">{value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3 text-sm font-bold text-white shadow-lg shadow-navy/25 transition hover:-translate-y-0.5 hover:bg-navy-light focus:outline-none focus:ring-4 focus:ring-navy/25"
        >
          Submit another response
        </button>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field id="name" label="Name" icon={<UserIcon />} error={shown("name")}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(shown("name"))}
          aria-describedby={shown("name") ? "name-error" : undefined}
          className={`${baseInput} ${inputState(Boolean(shown("name")))}`}
        />
      </Field>

      <Field id="email" label="Email" icon={<MailIcon />} error={shown("email")}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(shown("email"))}
          aria-describedby={shown("email") ? "email-error" : undefined}
          className={`${baseInput} ${inputState(Boolean(shown("email")))}`}
        />
      </Field>

      <Field id="phone" label="Phone" icon={<PhoneIcon />} error={shown("phone")}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0434 286 892"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(shown("phone"))}
          aria-describedby={shown("phone") ? "phone-error" : undefined}
          className={`${baseInput} ${inputState(Boolean(shown("phone")))}`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 hidden items-center text-xs font-bold tracking-wider text-slate-400 sm:flex">
          AU +61
        </span>
      </Field>

      <Field id="city" label="City" icon={<PinIcon />} error={shown("city")}>
        <select
          id="city"
          name="city"
          value={values.city}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(shown("city"))}
          aria-describedby={shown("city") ? "city-error" : undefined}
          className={`${baseInput} ${inputState(Boolean(shown("city")))} cursor-pointer appearance-none pr-12 ${
            values.city ? "" : "font-normal text-slate-400"
          }`}
        >
          <option value="" disabled>
            Select your city
          </option>
          {australianCities.map((group) => (
            <optgroup key={group.state} label={group.state}>
              {group.cities.map((city) => (
                <option key={`${group.state}-${city}`} value={city}>
                  {city}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-center text-navy">
          <svg
            {...iconProps}
            className="h-5 w-5 transition-transform group-focus-within:rotate-180"
            strokeWidth={2.4}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </Field>

      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-brand-red/30 bg-red-50 px-4 py-3 text-sm font-semibold text-brand-red"
        >
          <span className="mt-0.5">
            <AlertIcon />
          </span>
          <span>{serverError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="group relative mt-3 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red to-[#ee3b48] px-6 py-4 text-base font-extrabold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_-10px_rgba(215,32,46,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(215,32,46,0.8)] focus:outline-none focus:ring-4 focus:ring-brand-red/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
      >
        {/* shine */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity group-hover:animate-shine group-hover:opacity-100"
        />
        {status === "submitting" ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
            </svg>
            <span className="relative">Submitting…</span>
          </>
        ) : (
          <>
            <span className="relative">Submit Details</span>
            <svg
              {...iconProps}
              className="relative h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={2.6}
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>

      <p className="text-center text-xs font-medium text-slate-500">
        Fields marked <span className="font-bold text-brand-red">*</span> are required.
      </p>
    </form>
  );
}
