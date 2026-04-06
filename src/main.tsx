import { render } from "preact";
import { App } from "./App";
import "./styles.css";

const cloudflareAnalyticsToken = import.meta.env.VITE_CLOUDFLARE_ANALYTICS_TOKEN?.trim();

if (cloudflareAnalyticsToken && typeof document !== "undefined") {
  const existingScript = document.querySelector('script[data-plasn-analytics="cloudflare"]');

  if (!existingScript) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://static.cloudflareinsights.com/beacon.min.js";
    script.setAttribute("data-cf-beacon", JSON.stringify({ token: cloudflareAnalyticsToken }));
    script.setAttribute("data-plasn-analytics", "cloudflare");
    document.head.appendChild(script);
  }
}

render(<App />, document.getElementById("app")!);
