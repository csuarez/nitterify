// Builds the declarativeNetRequest dynamic rules that redirect X/Twitter
// to the given Nitter origin (e.g. "https://xcancel.com"). Shared by
// background.js and scripts/test-rules.mjs.
//
// Among matching rules the highest priority wins; "allow" means no redirect.

const SOURCE = "^https?://(?:www\\.|mobile\\.)?(?:x|twitter)\\.com";

// X app routes with no Nitter equivalent — never redirected, so logging in
// to the real site keeps working.
const APP_ROUTES = [
  "i", "home", "explore", "notifications", "messages", "settings", "compose",
  "login", "logout", "signup", "account", "intent", "share", "tos", "privacy",
  "jobs", "oauth", "download", "search-advanced", "communities", "premium",
  "verified-orgs-signup", "sw.js", "manifest.json",
];

function buildRules(origin) {
  const main = ["main_frame"];
  return [
    // Passthrough routes Nitter supports (keep query string).
    {
      id: 1,
      priority: 100,
      action: { type: "redirect", redirect: { regexSubstitution: `${origin}/\\1` } },
      condition: {
        regexFilter: `${SOURCE}/((?:search|hashtag/[^/?#]+)(?:[/?].*)?)$`,
        resourceTypes: main,
      },
    },
    // /i/web/status/{id} and /i/lists/{id} (beat the /i/ allow rule).
    {
      id: 2,
      priority: 100,
      action: { type: "redirect", redirect: { regexSubstitution: `${origin}/i/\\1/\\2` } },
      condition: {
        regexFilter: `${SOURCE}/i/(web/status|lists)/([0-9]+).*$`,
        resourceTypes: main,
      },
    },
    // App routes: leave alone.
    {
      id: 3,
      priority: 50,
      action: { type: "allow" },
      condition: {
        regexFilter: `${SOURCE}/(?:${APP_ROUTES.join("|").replace(/\./g, "\\.")})(?:[/?#].*)?$`,
        resourceTypes: main,
      },
    },
    // Everything else: same path on Nitter, tracking query (?s=20&t=…) dropped.
    {
      id: 4,
      priority: 1,
      action: { type: "redirect", redirect: { regexSubstitution: `${origin}/\\1` } },
      condition: {
        regexFilter: `${SOURCE}(?:/([^?#]*))?(?:[?#].*)?$`,
        resourceTypes: main,
      },
    },
  ];
}

globalThis.buildRules = buildRules;
