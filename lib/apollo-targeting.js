const COMPANY_SIZE_MAP = {
  "startup (1-20)": ["1,20"],
  "smb (21-200)": ["21,200"],
  "mid-market (201-1k)": ["201,1000"],
  "mid market (201-1k)": ["201,1000"],
  "enterprise (1k+)": ["1001,"],
};

const LOCATION_ALIASES = {
  usa: "United States",
  "u.s.a.": "United States",
  us: "United States",
  "u.s.": "United States",
  "united states of america": "United States",
  uk: "United Kingdom",
  "u.k.": "United Kingdom",
};

export function uniqueApolloValues(values = []) {
  const seen = new Set();
  return values.map(value => String(value || "").trim()).filter(Boolean).filter(value => {
    const key = value.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeApolloTitles(values = []) {
  return uniqueApolloValues(values.flatMap(value => String(value).includes("/")
    ? String(value).split("/").map(part => part.trim())
    : [value]));
}

export function normalizeApolloCompanySizes(values = []) {
  return uniqueApolloValues(values.flatMap(value => {
    const clean = String(value).trim();
    return COMPANY_SIZE_MAP[clean.toLocaleLowerCase()] || (/^\d+,\d*$/.test(clean) ? [clean] : []);
  }));
}

export function normalizeApolloLocations(values = []) {
  return uniqueApolloValues(values.map(value => LOCATION_ALIASES[String(value).trim().toLocaleLowerCase()] || value));
}

export function onboardingKeywordSuggestions(onboarding = {}) {
  const industries = uniqueApolloValues(onboarding.icp_target_industries || []);
  const product = String(onboarding.product_description || "").toLocaleLowerCase();
  const capabilities = [];
  if (/website|web site|webapp|web app/.test(product)) capabilities.push("web development");
  if (/\bapps?\b|mobile/.test(product)) capabilities.push("mobile app development");
  if (/\bai\b|artificial intelligence|automation/.test(product)) capabilities.push("AI automation");
  return uniqueApolloValues([...industries, ...capabilities]);
}

export function inferApolloSeniorities(titles = []) {
  const inferred = [];
  for (const title of normalizeApolloTitles(titles)) {
    const value = title.toLocaleLowerCase();
    if (/\bfounder\b|co-founder/.test(value)) inferred.push("founder");
    if (/\bowner\b/.test(value)) inferred.push("owner");
    if (/\bceo\b|chief executive|chief revenue|chief sales|c-suite/.test(value)) inferred.push("c_suite");
    if (/\bvp\b|vice president/.test(value)) inferred.push("vp");
    if (/\bhead\b/.test(value)) inferred.push("head");
    if (/\bdirector\b/.test(value)) inferred.push("director");
    if (/\bmanager\b/.test(value)) inferred.push("manager");
  }
  return uniqueApolloValues(inferred);
}

export function audienceDefaultsFromOnboarding(onboarding = {}) {
  const industries = uniqueApolloValues(onboarding.icp_target_industries || []);
  return {
    titles: normalizeApolloTitles(onboarding.icp_titles || []),
    locations: normalizeApolloLocations(onboarding.icp_geos || []),
    companySizes: normalizeApolloCompanySizes(onboarding.icp_company_sizes || []),
    industries,
    seniorities: inferApolloSeniorities(onboarding.icp_titles || []),
    keywordSuggestions: onboardingKeywordSuggestions(onboarding),
    keywords: "",
  };
}
