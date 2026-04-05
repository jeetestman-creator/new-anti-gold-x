import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { SettingsProvider } from "./contexts/SettingsContext.tsx";

// Initialize Sentry for real-time error tracking
Sentry.init({
  dsn: "https://7264a9388c3a886b45f4706598375811@o4508920959074304.ingest.us.sentry.io/4508920970346496",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, 
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <AppWrapper>
          <App />
        </AppWrapper>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>
);
