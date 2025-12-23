import React from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "styled-components";
import "react-toastify/dist/ReactToastify.css";

import { store } from "./app/store";
import theme from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import AppContent from "./AppContent";

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
