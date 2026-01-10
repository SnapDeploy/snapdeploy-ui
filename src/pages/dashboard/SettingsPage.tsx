import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  GitBranch,
  Clock,
  Github,
  Palette,
  AlertTriangle,
  Check,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";

export function SettingsPage() {
  const { user } = useUser();
  const [theme, setTheme] = useState<Theme>("light");
  const [defaultBranch, setDefaultBranch] = useState("main");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDeploymentDefaults = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    toast.success("Deployment defaults saved successfully");
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    // In a real app, you'd apply the theme here
    toast.success(`Theme changed to ${newTheme}`);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your application preferences and configurations
        </p>
      </div>

      {/* Deployment Defaults */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <GitBranch className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Deployment Defaults</CardTitle>
              <CardDescription>
                Configure default settings for new deployments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="default-branch">Default Branch</Label>
            <Input
              id="default-branch"
              value={defaultBranch}
              onChange={(e) => setDefaultBranch(e.target.value)}
              placeholder="main"
            />
            <p className="text-xs text-gray-500">
              The default Git branch used for new deployments
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveDeploymentDefaults} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-900">
              <Github className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Manage your connected GitHub account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Github className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user?.externalAccounts?.[0]?.username || "GitHub Connected"}
                </p>
                <p className="text-sm text-gray-500">
                  Connected via Clerk OAuth
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Your GitHub account is connected through Clerk authentication. To
            change your connected account, sign out and sign in with a different
            GitHub account.
          </p>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how SnapDeploy looks on your device
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Sun
                  className={`h-6 w-6 ${
                    theme === "light" ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === "light" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  Light
                </span>
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Moon
                  className={`h-6 w-6 ${
                    theme === "dark" ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  Dark
                </span>
              </button>
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "system"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Monitor
                  className={`h-6 w-6 ${
                    theme === "system" ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    theme === "system" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  System
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Select your preferred theme. System theme will automatically match
              your device settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-gray-900">Delete All Projects</p>
                <p className="text-sm text-gray-500">
                  Permanently delete all your projects and deployments
                </p>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Delete All
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-gray-900">Delete Account</p>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version Info */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Last synced: Just now</span>
        </div>
        <span>SnapDeploy v1.0.0</span>
      </div>
    </div>
  );
}
