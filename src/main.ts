import "./styles.css";
import { SolarSystemApp } from "./app";
import { APP_VERSION_LABEL } from "./config/appMetadata";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

document.title = APP_VERSION_LABEL;

const app = new SolarSystemApp(root);
app.start();
