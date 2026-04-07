import { render } from "preact";
import { App } from "./App";
import "./styles.css";

const cloudflareAnalyticsToken = import.meta.env.VITE_CF_WEB_ANALYTICS_TOKEN?.trim();

if (cloudflareAnalyticsToken) {
  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://static.cloudflareinsights.com/beacon.min.js";
  script.setAttribute(
    "data-cf-beacon",
    JSON.stringify({ token: cloudflareAnalyticsToken }),
  );
  document.head.appendChild(script);
}

render(<App />, document.getElementById("app")!);
