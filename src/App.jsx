import { useState } from "react";
import "./App.css";
import "./index.css";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./utils/idb.jsx";
import { Tooltip } from "react-tooltip";

function App() {
  return (
    <>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
      <Tooltip id="my-tooltip" />
      <Toaster
        position="top-center" // updated position
        reverseOrder={false}
        toastOptions={{
          className: "border",
          duration: 3000,
          removeDelay: 500,
          style: {
            background: "#161616FF",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </>
  );
}

export default App;
