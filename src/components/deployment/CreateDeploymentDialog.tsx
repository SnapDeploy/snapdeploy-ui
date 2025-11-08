import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket } from "lucide-react";

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
  const [formData, setFormData] = useState({
    commit_hash: defaultCommit,
    branch: defaultBranch,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createDeployment.mutate(
      {
        project_id: projectId,
        commit_hash: formData.commit_hash,
        branch: formData.branch,
      },
      {
        onSuccess: (deployment) => {
          setOpen(false);
          // Navigate to deployment view
          navigate(`/deployments/${deployment.id}`);
        },
        onError: (error) => {
          console.error("Deployment creation failed:", error);
          alert(`Failed to create deployment: ${error.message}`);
        },
      }
    );
  };

  return (
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
  );
}
