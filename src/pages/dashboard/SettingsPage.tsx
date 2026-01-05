import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your application preferences and configurations
        </p>
      </div>

      {/* Coming Soon Placeholder */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Settings className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Settings page is under development. Check back soon for configuration
            options and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

