<p align="center">
  <img src="assets/icon-128.png" alt="Nitterify icon" width="96" height="96">
</p>

# Nitterify

Firefox extension that automatically redirects X/Twitter URLs to a [Nitter](https://github.com/zedeus/nitter) instance of your choice — no login walls, no tracking by X.

## Setup

Nitterify ships with no default instance. Click the toolbar button, type a Nitter instance (e.g. `xcancel.com`, `nitter.net`, or your own self-hosted one) and press **Save**. Redirects start immediately; the icon turns black while active and gray while off.

## What gets redirected

Works for `x.com`, `twitter.com`, and their `www.`/`mobile.` variants. Nitter mirrors X's URL structure, so paths are kept as they are:

| X URL | Redirects to |
|---|---|
| `x.com/{username}` (and `/with_replies`, `/media`… tabs) | `{instance}/{username}` |
| `x.com/{username}/status/{id}` | `{instance}/{username}/status/{id}` |
| `x.com/i/web/status/{id}` | `{instance}/i/web/status/{id}` |
| `x.com/i/lists/{id}` | `{instance}/i/lists/{id}` |
| `x.com/search?q=…`, `x.com/hashtag/{tag}` | same path and query on `{instance}` |
| `x.com/` (homepage) | `{instance}/` |

Tracking parameters (`?s=20&t=…`) are dropped, except on search and hashtag pages where the query matters.

App routes with no Nitter equivalent (`/home`, `/i/flow/login`, `/settings`, `/messages`, `/notifications`, `/explore`, `/compose`, `/intent`, etc.) are never redirected, so logging in to real X still works.

Only top-level page navigations are redirected — embedded media and API requests are untouched.

## Toggle

Click the toolbar button to switch redirects on or off. The state and the chosen instance persist across browser restarts.

## Development

Run in a temporary Firefox profile:

```sh
npx web-ext run
```

Lint the extension:

```sh
npx web-ext lint
```

Test the redirect rules (simulates declarativeNetRequest matching against the rules built by `rules.js`):

```sh
node scripts/test-rules.mjs
```

Or load it manually: open `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick `manifest.json`.

Requires Firefox 142+ (Manifest V3 with `declarativeNetRequest` regex substitution).

## How it works

Since the destination is user-configurable, redirects use dynamic `declarativeNetRequest` rules instead of a static ruleset: `rules.js` builds them for the saved instance and `background.js` installs or removes them whenever the instance or toggle changes.

## License

[MIT](LICENSE)
