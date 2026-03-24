import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";

const footerColumns = [
  {
    title: "Product",
    links: ["Find Jobs", "Companies", "Salaries"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service"],
  },
];

export function SiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-[#d8d0c8]/60 bg-[#faf5ee] pt-20 pb-12"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-6">
          <Link
            href="#hero"
            className="font-serif text-3xl font-bold text-primary"
          >
            Qualify
          </Link>
          <p className="text-sm leading-relaxed text-stone-500">
            A recruitment revolution built on the belief that qualifications
            should be the foundation of every professional match. Simple. Smart.
            Sun-baked.
          </p>

          <div className="flex gap-4">
            {["language", "share", "campaign"].map((icon) => (
              <Link
                key={icon}
                href="#hero"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition-colors hover:bg-primary/5"
              >
                <MaterialSymbol
                  icon={icon}
                  className="text-[20px] text-primary"
                />
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#hero"
                      className="text-sm text-stone-500 transition-colors hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col gap-4 border-t border-outline-variant/30 px-8 pt-8 md:flex-row md:items-center md:justify-between">
        <span className="text-xs uppercase tracking-[0.28em] text-stone-500">
          © 2026 Qualify Inc. All rights reserved.
        </span>
        <span className="text-xs uppercase tracking-[0.28em] text-stone-500">
          Qualification First, Job Secured
        </span>
      </div>
    </footer>
  );
}
