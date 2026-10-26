import React from "react";
import AppRouter from "./router/AppRouter";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <div>
          <AppRouter />
        </div>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
