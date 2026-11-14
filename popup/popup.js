const toggle = document.getElementById("toggle");
const status = document.getElementById("status");
const form = document.getElementById("instance-form");
const input = document.getElementById("instance");
const error = document.getElementById("error");

let instance = null;

// "xcancel.com", "https://nitter.net/foo" → "https://xcancel.com", "https://nitter.net"
function normalize(value) {
  const raw = value.trim();
  if (!raw) return null;
  let url;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new Error("Not a valid URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Use an http(s) URL");
  }
  if (/(^|\.)(x|twitter)\.com$/i.test(url.hostname)) {
    throw new Error("That's X itself — pick a Nitter instance");
  }
  return url.origin;
}

function render() {
  toggle.disabled = !instance;
  if (!instance) {
    status.textContent = "Set a Nitter instance to start";
  } else if (toggle.checked) {
    status.textContent = `Redirecting X → ${new URL(instance).host}`;
  } else {
    status.textContent = "Redirects disabled";
  }
}

async function init() {
  const stored = await browser.storage.local.get(["instance", "enabled"]);
  instance = stored.instance ?? null;
  toggle.checked = stored.enabled ?? true;
  input.value = instance ? new URL(instance).host : "";
  render();
}

toggle.addEventListener("change", async () => {
  await browser.storage.local.set({ enabled: toggle.checked });
  render();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.hidden = true;
  let origin;
  try {
    origin = normalize(input.value);
  } catch (e) {
    error.textContent = e.message;
    error.hidden = false;
    return;
  }
  instance = origin;
  input.value = origin ? new URL(origin).host : "";
  await browser.storage.local.set({ instance: origin });
  render();
});

init();
