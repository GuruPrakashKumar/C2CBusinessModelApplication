import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {SnackbarProvider} from 'notistack'
import { ToastProvider } from "./context/ToastContext";

document.title = process.env.REACT_APP_BUSINESS_NAME || 'Welcome Back';

// Dynamically update the favicon
const setFavicon = (url) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  link.href = url;
};

// Set favicon from env or fallback to default
setFavicon(process.env.REACT_APP_FAVICON_URL || "/default-icon.png");

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={3}> 
      <ToastProvider>
        <App />
      </ToastProvider>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorker.unregister();
