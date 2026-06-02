// main.jsx
// Punto de entrada de la aplicación React (Vite).
// Renderiza el componente App en el DOM.

import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext.jsx";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>,
);
