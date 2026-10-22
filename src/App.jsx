import React from "react";
import AppRouter from "./router/AppRouter";
import { ShopProvider } from "../src/context/ShopContext";

import "./App.css";

function App() {
  return (
    <ShopProvider>
      <div>
        <AppRouter />
      </div>
    </ShopProvider>
  );
}

export default App;