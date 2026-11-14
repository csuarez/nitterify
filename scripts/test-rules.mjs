// Simulates Firefox's declarativeNetRequest evaluation of the rules built by
// rules.js: among matching rules the highest priority wins; "allow" means no
// redirect.
// Run: node scripts/test-rules.mjs
import "../rules.js";

const N = "https://nitter.example";
const rules = globalThis.buildRules(N);

function evaluate(url) {
  let winner = null;
  for (const rule of rules) {
    const re = new RegExp(rule.condition.regexFilter);
    if (!re.test(url)) continue;
    if (!winner || rule.priority > winner.priority) winner = rule;
  }
  if (!winner || winner.action.type === "allow") return null;
  const sub = winner.action.redirect.regexSubstitution.replace(/\\(\d)/g, "$$$1");
  return url.replace(new RegExp(winner.condition.regexFilter), sub);
}

const cases = [
  // [input, expected redirect or null]
  ["https://x.com/jack", `${N}/jack`],
  ["https://x.com/jack/", `${N}/jack/`],
  ["https://twitter.com/jack", `${N}/jack`],
  ["https://www.twitter.com/jack", `${N}/jack`],
  ["https://mobile.twitter.com/jack", `${N}/jack`],
  ["https://mobile.x.com/jack", `${N}/jack`],
  ["https://x.com/jack/with_replies", `${N}/jack/with_replies`],
  ["https://x.com/jack/media", `${N}/jack/media`],
  ["https://x.com/jack/status/20", `${N}/jack/status/20`],
  ["https://x.com/jack/status/20?s=20&t=abcDEF", `${N}/jack/status/20`],
  ["https://x.com/jack/status/20/photo/1", `${N}/jack/status/20/photo/1`],
  ["https://x.com/jack/status/20#m", `${N}/jack/status/20`],
  ["https://x.com/i/web/status/20", `${N}/i/web/status/20`],
  ["https://x.com/i/web/status/20?s=20", `${N}/i/web/status/20`],
  ["https://x.com/i/lists/123456", `${N}/i/lists/123456`],
  ["https://x.com/search?q=firefox&src=typed_query", `${N}/search?q=firefox&src=typed_query`],
  ["https://x.com/hashtag/firefox", `${N}/hashtag/firefox`],
  ["https://x.com/hashtag/firefox?src=hashtag_click", `${N}/hashtag/firefox?src=hashtag_click`],
  ["https://x.com/", `${N}/`],
  ["https://x.com", `${N}/`],
  ["http://twitter.com", `${N}/`],
  // usernames that merely start with an app-route word
  ["https://x.com/homer", `${N}/homer`],
  ["https://x.com/iamjack", `${N}/iamjack`],
  // must NOT redirect:
  ["https://x.com/home", null],
  ["https://x.com/i/flow/login", null],
  ["https://x.com/i/bookmarks", null],
  ["https://x.com/login", null],
  ["https://x.com/settings/account", null],
  ["https://x.com/messages", null],
  ["https://x.com/messages/123-456", null],
  ["https://x.com/notifications", null],
  ["https://x.com/explore", null],
  ["https://x.com/compose/post", null],
  ["https://twitter.com/intent/tweet?text=hi", null],
  ["https://x.com/logout", null],
  ["https://api.x.com/1.1/whatever", null],
  ["https://abs.twimg.com/x.com/foo", null],
  ["https://x.com.evil.example/jack", null],
  ["https://notx.com/jack", null],
];

let failed = 0;
for (const [url, expected] of cases) {
  const got = evaluate(url);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${url}\n      -> ${got}${ok ? "" : `  (expected ${expected})`}`);
}
console.log(failed ? `\n${failed} failing case(s)` : "\nAll cases pass");
process.exit(failed ? 1 : 0);
