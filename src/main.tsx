import React from "react";
import ReactDOM from "react-dom/client";
import { buildGestockViewModel } from "./application/buildGestockViewModel";
import { gestockSnapshot } from "./infrastructure/seedData";
import { App } from "./presentation/App";
import "./presentation/styles.css";

const viewModel = buildGestockViewModel(gestockSnapshot);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App model={viewModel} />
  </React.StrictMode>
);
