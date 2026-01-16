import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext"; // <-- import du LanguageProvider
import "./i18n/config";
import App from "./App";
import "./App.css";
import "./index.css";
import { StreamChatProvider } from "./contexts/StreamChatContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      
        <LanguageProvider>
          {" "}
          {/* <-- Ajouter LanguageProvider ici */}
          <ThemeProvider>
            <AuthProvider>
            <StreamChatProvider>
              <App />
            </StreamChatProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
