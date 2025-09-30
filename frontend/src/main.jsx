import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./index.css"; // Global CSS

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";

// Suspense Boundary dengan fallback sederhana
function SuspenseBoundary({ children }) {
  return (
    <Suspense
      fallback={
        <div className="text-center py-5">
          <span className="spinner-border text-info"></span>
          <p className="mt-2 text-info">Memuat...</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SuspenseBoundary>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </SuspenseBoundary>
  </React.StrictMode>
);
