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

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
