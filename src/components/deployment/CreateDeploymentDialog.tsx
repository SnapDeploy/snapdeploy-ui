import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeploymentMutations, ActiveDeploymentConflictError } from "@/hooks/useDeploymentMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, AlertTriangle } from "lucide-react";
import type { components } from "@/lib/api/generated/types";

type Deployment = components['schemas']['Deployment'];

interface CreateDeploymentDialogProps {
  projectId: string;
  trigger?: React.ReactNode;
  defaultBranch?: string;
  defaultCommit?: string;
}

export function CreateDeploymentDialog({
  projectId,
  trigger,
  defaultBranch = "main",
  defaultCommit = "",
}: CreateDeploymentDialogProps) {
  const navigate = useNavigate();
  const { createDeployment } = useDeploymentMutations();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [existingDeployment, setExistingDeployment] = useState<Deployment | null>(null);
  const [formData, setFormData] = useState({
    commit_hash: defaultCommit,
    branch: defaultBranch,
  });

  const doCreateDeployment = (force: boolean) => {
    createDeployment.mutate(
      {
        project_id: projectId,
        commit_hash: formData.commit_hash,
        branch: formData.branch,
        force,
      },
      {
        onSuccess: (deployment) => {
          setOpen(false);
          setConfirmOpen(false);
          setExistingDeployment(null);
          // Navigate to deployment view
          navigate(`/deployments/${deployment.id}`);
        },
        onError: (error) => {
          if (error instanceof ActiveDeploymentConflictError) {
            // Show confirmation dialog
            setExistingDeployment(error.existingDeployment);
            setConfirmOpen(true);
          } else {
            console.error("Deployment creation failed:", error);
            alert(`Failed to create deployment: ${error.message}`);
          }
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doCreateDeployment(false);
  };

  const handleForceReplace = () => {
    doCreateDeployment(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button data-deploy-button>
              <Rocket className="h-4 w-4 mr-2" />
              New Deployment
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Deployment</DialogTitle>
              <DialogDescription>
                Deploy your project with a specific commit and branch.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="commit_hash">
                  Commit Hash
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="commit_hash"
                  placeholder="abc123def456 or HEAD"
                  value={formData.commit_hash}
                  onChange={(e) =>
                    setFormData({ ...formData, commit_hash: e.target.value })
                  }
                  required
                  minLength={4}
                  maxLength={40}
                />
                <p className="text-sm text-gray-500">
                  Enter a Git commit hash (min 7 chars), "HEAD" for latest, or a
                  branch name
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="branch">
                  Branch
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="branch"
                  placeholder="main"
                  value={formData.branch}
                  onChange={(e) =>
                    setFormData({ ...formData, branch: e.target.value })
                  }
                  required
                  maxLength={255}
                />
                <p className="text-sm text-gray-500">
                  The Git branch to deploy from
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createDeployment.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createDeployment.isPending}>
                {createDeployment.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Deploy
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for replacing existing deployment */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Replace Active Deployment?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  This project already has an active deployment. Creating a new
                  deployment will:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Stop the currently running container</li>
                  <li>Clean up all associated AWS resources</li>
                  <li>Remove the existing deployment from the system</li>
                </ul>
                {existingDeployment && (
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium">Current deployment:</p>
                    <p className="text-muted-foreground">
                      Branch: {existingDeployment.branch} • Commit:{" "}
                      {existingDeployment.commit_hash?.substring(0, 7)}
                    </p>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createDeployment.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceReplace}
              disabled={createDeployment.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {createDeployment.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Replacing...
                </>
              ) : (
                "Replace Deployment"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
