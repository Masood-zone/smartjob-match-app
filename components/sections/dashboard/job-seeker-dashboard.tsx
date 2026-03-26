"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { useSession } from "@/lib/auth-client";

const overviewCards = [
  {
    label: "Total matches",
    value: "12",
    meta: "+3 this week",
    icon: "auto_awesome",
  },
  {
    label: "Applications sent",
    value: "4",
    meta: "Last sent 2d ago",
    icon: "send",
  },
  {
    label: "Profile completeness",
    value: "85%",
    meta: "Almost ready for stronger matches",
    icon: "progress_activity",
  },
] as const;

type MatchCard = {
  title: string;
  company: string;
  location: string;
  match: string;
  matchTone: string;
  required: string;
  yourQualification: string;
  statusTone: string;
  muted?: boolean;
};

const matches: MatchCard[] = [
  {
    title: "Software Developer",
    company: "TechFlow Systems",
    location: "Accra, Ghana",
    match: "100% Match",
    matchTone: "bg-emerald-50 text-emerald-700",
    required: "Bachelor's Degree",
    yourQualification: "Bachelor's Degree",
    statusTone: "text-emerald-700",
  },
  {
    title: "Data Analyst",
    company: "Insight Metrics",
    location: "Remote",
    match: "75% Match",
    matchTone: "bg-amber-50 text-amber-700",
    required: "Master's Degree",
    yourQualification: "Bachelor's Degree",
    statusTone: "text-amber-700",
  },
  {
    title: "Office Admin",
    company: "Global Logistics",
    location: "Takoradi, Ghana",
    match: "40% Match",
    matchTone: "bg-rose-50 text-rose-700",
    required: "5+ Years Experience",
    yourQualification: "2 Years Experience",
    statusTone: "text-rose-700",
    muted: true,
  },
];

const applications = [
  {
    title: "Senior UX Designer",
    company: "Velvet & Co.",
    date: "Oct 24, 2023",
    status: "Pending",
    tone: "bg-amber-100 text-amber-800",
  },
  {
    title: "Front-end Lead",
    company: "Nexus Labs",
    date: "Oct 20, 2023",
    status: "Accepted",
    tone: "bg-emerald-100 text-emerald-800",
  },
  {
    title: "Product Manager",
    company: "Aura Fintech",
    date: "Oct 15, 2023",
    status: "Rejected",
    tone: "bg-rose-100 text-rose-800",
  },
] as const;

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: "dashboard", active: true, href: "#" },
  { label: "My Matches", icon: "stars", href: "#matches" },
  { label: "Applications", icon: "description", href: "#applications" },
  { label: "Messages", icon: "mail", href: "#" },
  { label: "Settings", icon: "settings", href: "#" },
];

export function JobSeekerDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(240,168,120,0.18),transparent_28%),linear-gradient(180deg,#faf5ee_0%,#f8f1e7_100%)] text-on-background">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-outline-variant/60 bg-surface-container-lowest/92 py-6 backdrop-blur md:flex">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-serif font-black text-primary">
            Qualify
          </h1>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
            Job seeker dashboard
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${item.active ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"}`}
            >
              <MaterialSymbol icon={item.icon} className="text-[18px]" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 mt-auto">
          <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.2)] transition-colors hover:bg-primary/90">
            <MaterialSymbol icon="add" className="text-[16px]" />
            Explore roles
          </button>
        </div>

        <div className="border-t border-outline-variant/60 pt-4 space-y-1">
          <a
            className="mx-2 flex items-center gap-3 rounded-xl px-4 py-2 text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            href="#"
          >
            <MaterialSymbol icon="help" className="text-[16px]" />
            Help Center
          </a>
          <a
            className="mx-2 flex items-center gap-3 rounded-xl px-4 py-2 text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            href="#"
          >
            <MaterialSymbol icon="logout" className="text-[16px]" />
            Logout
          </a>
        </div>
      </aside>

      <div className="md:ml-64 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface-container-lowest/92 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-primary md:hidden">
                Qualify
              </h2>
              <div className="hidden md:block">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                  Dashboard
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <label className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm text-on-surface-variant sm:flex">
                <MaterialSymbol
                  icon="search"
                  className="text-[16px] text-outline"
                />
                <input
                  className="w-48 bg-transparent outline-none placeholder:text-outline"
                  placeholder="Search matches..."
                  type="search"
                />
              </label>
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                <MaterialSymbol icon="notifications" className="text-[18px]" />
              </button>
              <div className="flex items-center gap-3 border-l border-outline-variant pl-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-primary bg-primary/10 text-xs font-semibold text-primary">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name ? `${user.name} avatar` : "User avatar"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{user?.name ? user.name[0] : "U"}</span>
                  )}
                </div>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {user?.name || "Job seeker"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    {user?.email || "account@qualify.app"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <section className="grid gap-6 md:grid-cols-3">
            {overviewCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[1.5rem] border border-outline-variant/70 bg-surface-container-low p-6 shadow-[0_8px_30px_rgba(58,48,42,0.04)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                      {card.label}
                    </p>
                    <h3 className="mt-2 text-4xl font-serif font-bold text-on-surface">
                      {card.value}
                    </h3>
                  </div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MaterialSymbol icon={card.icon} className="text-[20px]" />
                  </span>
                </div>
                <p className="mt-4 text-sm text-primary">{card.meta}</p>
              </article>
            ))}
          </section>

          <section id="matches">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-serif font-bold text-on-surface">
                  Job Matches
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Curated recommendations based on your profile.
                </p>
              </div>
              <button className="border-b-2 border-primary pb-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary transition-all hover:pb-2">
                View all
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {matches.map((match) => (
                <article
                  key={match.title}
                  className={`flex flex-col rounded-[1.5rem] border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-[0_10px_36px_rgba(58,48,42,0.05)] transition-all hover:border-primary/40 ${match.muted ? "opacity-80 grayscale-[0.2]" : ""}`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container-high text-primary">
                      <MaterialSymbol
                        icon={
                          match.title === "Software Developer"
                            ? "code"
                            : match.title === "Data Analyst"
                              ? "analytics"
                              : "desk"
                        }
                        className={`text-[20px] ${match.muted ? "text-on-surface-variant" : "text-primary"}`}
                      />
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] ${match.matchTone}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {match.match}
                    </div>
                  </div>

                  <h3
                    className={`text-2xl font-serif font-bold ${match.muted ? "text-on-surface-variant" : "text-on-surface"}`}
                  >
                    {match.title}
                  </h3>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {match.company} • {match.location}
                  </p>

                  <div className="mt-6 flex-1 space-y-4">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="uppercase tracking-[0.24em] text-on-surface-variant">
                        Required
                      </span>
                      <span className="font-semibold text-on-surface">
                        {match.required}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="uppercase tracking-[0.24em] text-on-surface-variant">
                        Your qualification
                      </span>
                      <span className={`font-semibold ${match.statusTone}`}>
                        {match.yourQualification}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`mt-8 inline-flex cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.28em] transition-all ${match.muted ? "cursor-not-allowed border-outline-variant text-on-surface-variant" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}
                    disabled={match.muted}
                  >
                    {match.muted ? "Insufficient match" : "Apply now"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section
            id="applications"
            className="rounded-[1.75rem] border border-outline-variant/70 bg-surface-container-low p-6 shadow-[0_8px_30px_rgba(58,48,42,0.04)] sm:p-8"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-on-surface">
                Recent Applications
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-on-surface-variant">
                Track your progress
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left">
                <thead>
                  <tr className="border-b border-outline-variant/50 text-xs uppercase tracking-[0.28em] text-on-surface-variant">
                    <th className="pb-4 font-semibold px-2">Job title</th>
                    <th className="pb-4 font-semibold px-2">Company</th>
                    <th className="pb-4 font-semibold px-2">Applied date</th>
                    <th className="pb-4 font-semibold px-2">Status</th>
                    <th className="pb-4 font-semibold px-2 text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {applications.map((item) => (
                    <tr
                      key={item.title}
                      className="transition-colors hover:bg-surface-container-lowest/70"
                    >
                      <td className="py-5 px-2 font-serif text-lg font-semibold text-on-surface">
                        {item.title}
                      </td>
                      <td className="py-5 px-2 text-sm text-on-surface-variant">
                        {item.company}
                      </td>
                      <td className="py-5 px-2 text-sm text-on-surface-variant">
                        {item.date}
                      </td>
                      <td className="py-5 px-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${item.tone}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-5 px-2 text-right">
                        <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary">
                          <MaterialSymbol
                            icon="more_horiz"
                            className="text-[18px]"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <footer className="border-t border-outline-variant/60 bg-surface-container-lowest/80 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="font-serif text-lg text-primary">Qualify</p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                Built for job seekers who want a clearer match path.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[10px] uppercase tracking-[0.28em] text-on-surface-variant sm:justify-end">
              <a href="#" className="transition-colors hover:text-primary">
                Privacy policy
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                Terms of service
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                Contact us
              </a>
            </div>
          </div>
        </footer>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-outline-variant/60 bg-surface-container-lowest/95 px-4 py-3 backdrop-blur md:hidden">
        {[
          ["Dashboard", "dashboard"],
          ["Matches", "stars"],
          ["Inbox", "mail"],
          ["Profile", "person"],
        ].map(([label, icon]) => (
          <a
            key={label}
            href="#"
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${label === "Dashboard" ? "text-primary" : "text-on-surface-variant"}`}
          >
            <MaterialSymbol icon={icon} className="text-[18px]" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
