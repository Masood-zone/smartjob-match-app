export function getStatusTone(status: string) {
  if (status === "ACCEPTED") return "bg-emerald-100 text-emerald-800";
  if (status === "REJECTED") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}

export function getMatchTone(matchType: string) {
  if (matchType === "EXCELLENT") return "bg-emerald-100 text-emerald-800";
  if (matchType === "GOOD") return "bg-amber-100 text-amber-800";
  if (matchType === "AVERAGE") return "bg-orange-100 text-orange-800";
  return "bg-stone-100 text-stone-800";
}

export function getCompanyInitials(companyName: string) {
  return companyName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
