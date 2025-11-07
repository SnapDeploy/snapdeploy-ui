import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  SignInPage,
  Overview,
  DeploymentsPage,
  ProfilePage,
  SettingsPage,
  ProjectsPage,
  ProjectDetailPage,
  CreateProjectPage,
} from "./pages";
import { DeploymentViewPage } from "./pages/deployment/DeploymentViewPage";
import { DeploymentsListPage } from "./pages/deployment/DeploymentsListPage";
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
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route
              path="/projects/:projectId/deployments"
              element={<DeploymentsListPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/deployments/:id" element={<DeploymentViewPage />} />
        </Routes>
      </SignedIn>
    </BrowserRouter>
  );
}

export default App;
