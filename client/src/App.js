import React from "react";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import AppContent from "./AppContent";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Global error handler for uncaught errors
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global error:", { message, source, lineno, colno, error });
  return false; // Let the default handler run too
};

// Handle unhandled promise rejections
window.onunhandledrejection = function (event) {
  console.error("Unhandled rejection:", event.reason);
};

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppContent />
        <ToastContainer />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
