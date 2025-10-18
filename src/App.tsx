import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  SignInPage,
  Overview,
  DeploymentsPage,
  ProfilePage,
  SettingsPage,
} from "./pages";
import { DashboardLayout } from "./components/layout/DashboardLayout";

function TestComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          SnapDeploy Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Please set your VITE_CLERK_PUBLISHABLE_KEY in a .env file to enable
          authentication.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}

function App() {
  const hasValidClerkKey =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder";

  return (
    <BrowserRouter>
      {!hasValidClerkKey ? (
        <TestComponent />
      ) : (
        <>
          <SignedOut>
            <SignInPage />
          </SignedOut>
          <SignedIn>
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Overview />} />
                <Route path="/deployments" element={<DeploymentsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </SignedIn>
        </>
      )}
    </BrowserRouter>
  );
}

export default App;
