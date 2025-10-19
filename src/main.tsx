import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";
import "./index.css";

const PUBLISHABLE_KEY = `pk_test_anVzdC1maWxseS0yMC5jbGVyay5hY2NvdW50cy5kZXYk`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>
);
