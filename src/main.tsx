import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/query-client";
import { UserProvider } from "./context/UserContext";
import { Toaster } from "sonner";
import "./index.css";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? `pk_test_your-publishable-key`;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <UserProvider>
          <App />
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </UserProvider>
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>
);
