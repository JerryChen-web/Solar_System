import "./styles.css";
import { SolarSystemApp } from "./app";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("Missing #app root element.");
}

const app = new SolarSystemApp(root);
app.start();

