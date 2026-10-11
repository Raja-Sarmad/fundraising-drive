import FundraisingForm from "@/components/FundraisingForm";

function Star({
  className,
  size = 18,
  delay = "0s",
}: {
  className?: string;
  size?: number;
  delay?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      className={`absolute animate-twinkle text-white ${className ?? ""}`}
      style={{ animationDelay: delay }}
      fill="currentColor"
    >
      <path d="M12 0c.6 7.2 4.8 11.4 12 12-7.2.6-11.4 4.8-12 12-.6-7.2-4.8-11.4-12-12C7.2 11.4 11.4 7.2 12 0z" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
      {/* Sky → sea → sand backdrop inspired by the poster */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#cfeafa_0%,#8dd1f1_40%,#2ea7dc_66%,#f3dfb5_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-0 -z-10 h-96 w-96 animate-float rounded-full bg-white/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-24 -z-10 h-[28rem] w-[28rem] animate-float rounded-full bg-white/50 blur-3xl [animation-delay:-3s]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -z-10 h-72 w-[150%] -translate-x-1/2 rounded-[100%] bg-[#f7e9c9]/90 blur-2xl"
      />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-20px_rgba(6,27,61,0.55)] ring-1 ring-white/70 lg:grid-cols-[1.05fr_1fr]">
        {/* ───────────── Hero panel ───────────── */}
        <aside className="relative isolate min-w-0 overflow-hidden bg-navy px-5 pb-12 pt-10 text-white sm:px-10 sm:pt-12 lg:px-12 lg:py-16">
          {/* glows */}
          <div
            aria-hidden="true"
            className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-sky/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-20 -z-10 h-96 w-96 rounded-full bg-brand-red/40 blur-3xl"
          />
          {/* subtle grid texture */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:32px_32px]"
          />
          {/* Southern Cross */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-3 h-28 w-28 opacity-80 sm:right-8 sm:top-5"
          >
            <Star className="left-12 top-0" size={14} delay="0s" />
            <Star className="left-1 top-10" size={12} delay="0.8s" />
            <Star className="left-22 top-12" size={12} delay="1.6s" />
            <Star className="left-13 top-22" size={16} delay="2.4s" />
            <Star className="left-18 top-8" size={8} delay="3s" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/10 py-1.5 pl-4 pr-3 text-[11px] font-bold uppercase tracking-[0.32em] text-white/90 backdrop-blur">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand-red shadow-[0_0_0_4px_rgba(215,32,46,0.3)]" />
              Join us on
            </span>

            <h1 className="mt-6 font-black uppercase leading-[0.95] tracking-tight">
              <span className="block text-[clamp(1.7rem,8.4vw,2.6rem)] sm:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Australia
              </span>
              <span className="block text-[clamp(1.7rem,8.4vw,2.6rem)] sm:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Fundraising
              </span>
            </h1>

            <div className="mt-2 flex items-center gap-4">
              <span className="h-1 w-20 rounded-full bg-brand-red" />
              <span className="font-script text-6xl leading-none text-white sm:text-7xl">
                <span className="text-brand-red drop-shadow-[0_2px_12px_rgba(215,32,46,0.6)]">
                  Drive
                </span>
              </span>
            </div>

            <p className="mt-8 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
              Be part of the drive. Fill in your details and we&apos;ll keep
              you updated with everything you need to know.
            </p>

            <ul className="mt-8 hidden flex-col gap-3 text-sm text-white/85 sm:flex">
              {[
                "Takes less than a minute",
                "Your details stay private",
                "We'll reach out on email or phone",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 10 3.5 3.5L15 7" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* flag-inspired stripe */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-2 bg-[linear-gradient(90deg,#d7202e_0%,#d7202e_35%,#ffffff_35%,#ffffff_42%,#2ea7dc_42%,#2ea7dc_100%)]"
          />
        </aside>

        {/* ───────────── Form panel ───────────── */}
        <section className="relative px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-red">
              Registration
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              Register your details
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Fill in the form below and we&apos;ll get back to you shortly.
            </p>
          </div>
          <FundraisingForm />
        </section>
      </div>
    </main>
  );
}
