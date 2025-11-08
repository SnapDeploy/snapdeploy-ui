import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Key, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/generated/client";

interface ProjectEnvironmentVariablesProps {
  projectId: string;
}

export function ProjectEnvironmentVariables({ projectId }: ProjectEnvironmentVariablesProps) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Fetch environment variables
  const { data: envVarsData, isLoading } = useQuery({
    queryKey: ["projects", projectId, "env"],
    queryFn: async () => {
      const response = await apiClient.GET("/projects/{id}/env", {
        params: { path: { id: projectId } },
      });
      if (!response.data) {
        throw new Error("Failed to fetch environment variables");
      }
      return response.data;
    },
  });

  // Create/Update environment variable
  const createEnvVarMutation = useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const response = await apiClient.POST("/projects/{id}/env", {
        params: { path: { id: projectId } },
        body: data,
      });
      if (!response.data) {
        throw new Error("Failed to create environment variable");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "env"] });
      setShowAddDialog(false);
      setNewKey("");
      setNewValue("");
    },
  });

  // Delete environment variable
  const deleteEnvVarMutation = useMutation({
    mutationFn: async (key: string) => {
      await apiClient.DELETE("/projects/{id}/env/{key}", {
        params: { path: { id: projectId, key } },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "env"] });
      setDeleteTarget(null);
    },
  });

  const handleAddEnvVar = () => {
    if (!newKey || !newValue) return;
    createEnvVarMutation.mutate({ key: newKey, value: newValue });
  };

  const handleDeleteEnvVar = (key: string) => {
    deleteEnvVarMutation.mutate(key);
  };

  const envVars = envVarsData?.environment_variables || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Environment Variables
          </CardTitle>
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Secure & Encrypted</AlertTitle>
          <AlertDescription>
            Environment variables are encrypted on the server. Values are
            masked for security and never sent to the frontend.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : envVars.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No environment variables configured</p>
            <p className="text-sm mt-1">
              Add environment variables for your deployments
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {envVars.map((envVar) => (
              <div
                key={envVar.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-semibold text-gray-900">
                      {envVar.key}
                    </code>
                  </div>
                  <code className="text-xs text-gray-500 font-mono">
                    {envVar.value}
                  </code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(envVar.key ?? "")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 text-xs text-gray-500 border-t">
          <p>
            💡 <strong>Tip:</strong> Environment variables will be available to your deployed containers.
            Common examples: DATABASE_URL, API_KEY, PORT
          </p>
        </div>
      </CardContent>

      {/* Add Environment Variable Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Environment Variable</DialogTitle>
            <DialogDescription>
              Add a new environment variable to your project. The value will be
              encrypted and stored securely.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key *</Label>
              <Input
                id="key"
                placeholder="DATABASE_URL"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                Use uppercase letters, numbers, and underscores (e.g., API_KEY, DATABASE_URL)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="password"
                placeholder="Your secret value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                This value will be encrypted and stored securely
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewKey("");
                setNewValue("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddEnvVar}
              disabled={!newKey || !newValue || createEnvVarMutation.isPending}
            >
              {createEnvVarMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Environment Variable</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <code className="font-mono font-semibold">{deleteTarget}</code>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  handleDeleteEnvVar(deleteTarget);
                }
              }}
              disabled={deleteEnvVarMutation.isPending}
            >
              {deleteEnvVarMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

