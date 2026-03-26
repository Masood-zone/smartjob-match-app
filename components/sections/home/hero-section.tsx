"use client";
import Link from "next/link";
import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import Image from "next/image";

import { JobSeekerAccessButton } from "./job-seeker-access-button";
import { useSession } from "@/lib/auth-client";

type HeroRole = "USER" | "JOB_SEEKER" | "EMPLOYER" | "ADMIN";

type HeroSessionUser = {
  role?: string | null;
};

function normalizeRole(role?: string | null): HeroRole | undefined {
  const normalizedRole = role?.toUpperCase();

  if (
    normalizedRole === "USER" ||
    normalizedRole === "JOB_SEEKER" ||
    normalizedRole === "EMPLOYER" ||
    normalizedRole === "ADMIN"
  ) {
    return normalizedRole;
  }

  return undefined;
}

const trustedFaces = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC52DoNfvod0oxeIlyTaFqxnpSaOFEa5vuCEy2CtOGY5Sf7tcuvv5eR6DB0KQFA81skTlMJk_e7xvph6t697hNyB-4zeJjJgyJoCI0zmh814c6HtlY2cz_eP9D7Gpz5vYdA8kGr7NWduSesO4MEb-vUuKRdpIvBOM0xBiYPYb1SXDhA7_hPOvHXijB3PUCBmewQixXc1wfszkQav1oe1HrUEfKXv7sKzJTHJQ9R998xBImNsrBE5i02HW4c0EpcClLNVd5ml_yslYM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAKtipXnKuOEIMAcsefw7BmUiSvAa9uIcn_vRXTQ9bOUdUd4KgWzekeQD0J-Ilo1MatY21RHQ3yaXRfhp63lXh_lPksJGy2XOBkAoVrM6-67pJ74OxL3TyCqYdzFtxag65s115o-tWfV1Ikq9EY2xS90Q1NrZERgGXrRl6jVNvd75OBgyJmkaGI3b-Bf7mNh7cgokzF1hO1xEpXxCIBsqnISJ5BNFWLvsP1IaQxBVfbZ0An-MfqitZVsqYjQKGErBLDx79AhFNNC70",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB2kjiOUmaIQ2Pxwn8Mzx3I3YItru1cnpuC9mJLT0IlZLjGhWJmgFHBaXDbD1rTFHXDhLAK4koZzLJk7icKCD9zmT_7Ofu1X-RvkkAK2iY1r6dBdgeHGxZTSMgr2CtvGNBJG2cLBHi8JHyVBIwxRiTg0p5UHu_RhLIhiZyEx4Y1-cMEDvC662NaXR2eb_N6CmUl3a001Wlgdi8EK5S3Vful0wgFHsOE7I9TH6P9es90EmkKNsEB3OumgcLv9uh3qXAzvstHDfcBADw",
];

export function HeroSection() {
  const { data: session } = useSession();
  const user = session?.user as HeroSessionUser | undefined;
  const role = normalizeRole(user?.role);

  return (
    <section
      id="hero"
      className="relative overflow-hidden px-6 pt-8 pb-20 lg:pt-10 lg:pb-28"
    >
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-tertiary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-primary">
            <MaterialSymbol icon="verified" filled className="text-[14px]" />
            Qualification-first recruitment
          </div>

          <div className="space-y-5">
            <h1 className="max-w-xl text-5xl leading-[0.92] tracking-tight text-on-surface sm:text-6xl lg:text-7xl">
              Find Jobs That Match Your{" "}
              <span className="italic text-primary">Qualifications</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-on-surface-variant sm:text-xl">
              The modern recruitment platform that prioritizes your education
              and credentials for the perfect fit.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            {!role || role === "USER" ? (
              <>
                <JobSeekerAccessButton className="cursor-pointer inline-flex h-auto items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                  Get Started as Job Seeker
                  <MaterialSymbol
                    icon="arrow_forward"
                    className="text-[18px]"
                  />
                </JobSeekerAccessButton>
                <Link
                  href="/onboarding/employer"
                  className="cursor-pointer inline-flex h-auto items-center justify-center rounded-lg border border-primary px-8 py-4 text-base font-bold text-primary transition-colors hover:bg-primary/5"
                >
                  Post a Job as Employer
                </Link>
              </>
            ) : null}

            {role === "JOB_SEEKER" ? (
              <Link
                href="/onboarding/job-seeker/dashboard"
                className="cursor-pointer inline-flex h-auto items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Apply for Job Listings
                <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
              </Link>
            ) : null}

            {role === "EMPLOYER" ? (
              <Link
                href="/onboarding/employer/dashboard"
                className="cursor-pointer inline-flex h-auto items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Post a Job
                <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
              </Link>
            ) : null}

            {role === "ADMIN" ? (
              <Link
                href="/admin/dashboard"
                className="cursor-pointer inline-flex h-auto items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                System Dashboard
                <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-5 pt-4">
            <div className="flex -space-x-3">
              {trustedFaces.map((src, index) => (
                <div
                  key={src}
                  className="h-10 w-10 overflow-hidden rounded-full border-2 border-surface bg-stone-200"
                  style={{ zIndex: trustedFaces.length - index }}
                >
                  <Image
                    src={src}
                    alt={`Professional profile ${index + 1}`}
                    width={40}
                    height={40}
                    loading="eager"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              Joined by 10,000+ top-tier qualified professionals
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="relative z-10 overflow-hidden rounded-2xl border border-outline-variant shadow-[0_24px_70px_rgba(58,48,42,0.18)]">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVzd6-L0NyGzald8jU0NFIa631D6buQtUwXDSdzQpSy0VuzLy_zVlVAjE-gHoGyCxa9T5z3DFObxmSDAzHBMqkDqSHHAD9_v746wVVtd5vQcdMI-06ihjiIUnU--LPLvjJ_56du4LmSTWTeZDMv5TogQvl-WNx3HxnXa3Z9vrux4AsJ9YghoafBedQRw4wVUyT-CkOWzOTTfa0omFYhRm2-ISDwRJ_eSZtx-wUpxbQ4-jBRNVdXwcMgifRpxoHUi0ERdMtDiLd6_8"
              alt="Modern minimalist home office workspace"
              className="aspect-4/5 w-full object-cover"
              loading="eager"
              width={400}
              height={500}
            />

            {/* <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-outline-variant bg-surface/90 p-5 shadow-lg backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  Recent Match
                </span>
                <span className="text-xs text-on-surface-variant">
                  2 mins ago
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-container text-on-primary">
                  <MaterialSymbol icon="architecture" className="text-[24px]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    Senior UI Architect
                  </h3>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-on-surface-variant">
                    Verified Qualification: Masters in Design
                  </p>
                </div>
              </div>
            </div> */}
          </div>

          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-tertiary/10 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
