# Deployment Hooks Reference

Quick reference for using deployment hooks in SnapDeploy UI.

## 🎣 Available Hooks

### Mutations (Write Operations)

```typescript
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";

const {
  createDeployment,
  updateDeploymentStatus,
  appendDeploymentLog,
  deleteDeployment,
} = useDeploymentMutations();
```

### Queries (Read Operations)

```typescript
import {
  useDeployment,
  useProjectDeployments,
  useLatestProjectDeployment,
  useUserDeployments,
  getDeploymentStatusColor,
  isDeploymentInProgress,
  isDeploymentTerminal,
} from "@/hooks/useDeployments";
```

---

## 📖 Usage Examples

### 1. Create Deployment

```typescript
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";

function DeployButton({ projectId }: { projectId: string }) {
  const { createDeployment } = useDeploymentMutations();

  const handleDeploy = () => {
    createDeployment.mutate(
      {
        project_id: projectId,
        commit_hash: "abc123", // Get from form or Git API
        branch: "main",
      },
      {
        onSuccess: (deployment) => {
          console.log("Deployment created:", deployment.id);
          // Navigate to deployment page
          navigate(`/deployments/${deployment.id}`);
        },
        onError: (error) => {
          console.error("Failed to create deployment:", error);
        },
      }
    );
  };

  return (
    <button onClick={handleDeploy} disabled={createDeployment.isPending}>
      {createDeployment.isPending ? "Creating..." : "Deploy Now"}
    </button>
  );
}
```

### 2. Display Deployment Status

```typescript
import {
  useDeployment,
  getDeploymentStatusColor,
} from "@/hooks/useDeployments";
import { Badge } from "@/components/ui/badge";

function DeploymentStatusBadge({ deploymentId }: { deploymentId: string }) {
  // Auto-refreshes every 2 seconds while in progress
  const { data: deployment, isLoading } = useDeployment(deploymentId);

  if (isLoading) return <Badge>Loading...</Badge>;
  if (!deployment) return null;

  const statusColor = getDeploymentStatusColor(deployment.status!);

  return <Badge className={statusColor}>{deployment.status}</Badge>;
}
```

### 3. List Project Deployments

```typescript
import { useProjectDeployments } from "@/hooks/useDeployments";
import { Card } from "@/components/ui/card";

function ProjectDeploymentsList({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useProjectDeployments(projectId);

  if (isLoading) return <div>Loading deployments...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.deployments?.length) {
    return <div>No deployments yet. Create your first one!</div>;
  }

  return (
    <div className="space-y-4">
      <h2>Deployments ({data.pagination?.total})</h2>
      {data.deployments.map((deployment) => (
        <Card key={deployment.id} className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-mono">{deployment.commit_hash}</p>
              <p className="text-sm text-gray-500">{deployment.branch}</p>
            </div>
            <Badge className={getDeploymentStatusColor(deployment.status!)}>
              {deployment.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 4. Show Latest Deployment

```typescript
import { useLatestProjectDeployment } from "@/hooks/useDeployments";

function LatestDeploymentWidget({ projectId }: { projectId: string }) {
  // Auto-refreshes if deployment is in progress
  const { data: deployment } = useLatestProjectDeployment(projectId);

  if (!deployment) {
    return (
      <div className="text-center p-8 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">No deployments yet</p>
        <p className="text-sm">Deploy your project to get started!</p>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Latest Deployment</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Status:</span>
          <Badge className={getDeploymentStatusColor(deployment.status!)}>
            {deployment.status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Commit:</span>
          <code className="text-sm">{deployment.commit_hash}</code>
        </div>
        <div className="flex justify-between">
          <span>Branch:</span>
          <span>{deployment.branch}</span>
        </div>
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(deployment.created_at!).toLocaleString()}</span>
        </div>
      </div>
    </Card>
  );
}
```

### 5. Display Deployment Logs

```typescript
import { useDeployment } from "@/hooks/useDeployments";
import { ScrollArea } from "@/components/ui/scroll-area";

function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const { data: deployment } = useDeployment(deploymentId);

  if (!deployment) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Deployment Logs</h3>
      <ScrollArea className="h-96 w-full rounded-md border bg-black text-green-400 p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap">
          {deployment.logs || "No logs yet..."}
        </pre>
      </ScrollArea>
    </Card>
  );
}
```

### 6. Update Deployment Status

```typescript
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import { Select } from "@/components/ui/select";

function DeploymentStatusUpdater({ deploymentId }: { deploymentId: string }) {
  const { updateDeploymentStatus } = useDeploymentMutations();

  const handleStatusChange = (newStatus: string) => {
    updateDeploymentStatus.mutate({
      id: deploymentId,
      data: { status: newStatus },
    });
  };

  return (
    <Select onValueChange={handleStatusChange}>
      <option value="PENDING">Pending</option>
      <option value="BUILDING">Building</option>
      <option value="DEPLOYING">Deploying</option>
      <option value="DEPLOYED">Deployed</option>
      <option value="FAILED">Failed</option>
      <option value="ROLLED_BACK">Rolled Back</option>
    </Select>
  );
}
```

### 7. Delete Deployment

```typescript
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import { Button } from "@/components/ui/button";

function DeleteDeploymentButton({ deploymentId }: { deploymentId: string }) {
  const { deleteDeployment } = useDeploymentMutations();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this deployment?")) {
      deleteDeployment.mutate(deploymentId, {
        onSuccess: () => {
          // Navigate back or show success message
          navigate("/deployments");
        },
      });
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={deleteDeployment.isPending}
    >
      {deleteDeployment.isPending ? "Deleting..." : "Delete Deployment"}
    </Button>
  );
}
```

### 8. Complete Deployment Form

```typescript
import { useState } from "react";
import { useDeploymentMutations } from "@/hooks/useDeploymentMutations";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CreateDeploymentForm({ projectId }: { projectId: string }) {
  const navigate = useNavigate();
  const { createDeployment } = useDeploymentMutations();
  const [formData, setFormData] = useState({
    commit_hash: "",
    branch: "main",
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
          // Navigate to deployment details page
          navigate(`/deployments/${deployment.id}`);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="commit_hash">Commit Hash</Label>
        <Input
          id="commit_hash"
          value={formData.commit_hash}
          onChange={(e) =>
            setFormData({ ...formData, commit_hash: e.target.value })
          }
          placeholder="abc123def456"
          required
          minLength={7}
          maxLength={40}
        />
      </div>

      <div>
        <Label htmlFor="branch">Branch</Label>
        <Input
          id="branch"
          value={formData.branch}
          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          placeholder="main"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={createDeployment.isPending}
        className="w-full"
      >
        {createDeployment.isPending ? "Creating Deployment..." : "Deploy"}
      </Button>

      {createDeployment.error && (
        <div className="text-red-500 text-sm">
          Error: {createDeployment.error.message}
        </div>
      )}
    </form>
  );
}
```

### 9. Deployment Timeline (with Auto-Refresh)

```typescript
import { useProjectDeployments } from "@/hooks/useDeployments";
import { isDeploymentInProgress } from "@/hooks/useDeployments";

function DeploymentTimeline({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectDeployments(projectId, 1, 10);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-2">
      {data?.deployments?.map((deployment) => (
        <div
          key={deployment.id}
          className={`flex items-center gap-4 p-3 rounded ${
            isDeploymentInProgress(deployment.status!)
              ? "bg-blue-50 animate-pulse"
              : ""
          }`}
        >
          <div className="text-2xl">
            {DEPLOYMENT_STATUS_ICONS[deployment.status as DeploymentStatus]}
          </div>
          <div className="flex-1">
            <p className="font-medium">{deployment.commit_hash}</p>
            <p className="text-sm text-gray-500">
              {deployment.branch} •{" "}
              {new Date(deployment.created_at!).toLocaleString()}
            </p>
          </div>
          <Badge className={getDeploymentStatusColor(deployment.status!)}>
            {DEPLOYMENT_STATUS_LABELS[deployment.status as DeploymentStatus]}
          </Badge>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Styling Constants

### Status Colors (Tailwind)

```typescript
const statusColors = {
  PENDING: "text-gray-500 bg-gray-100",
  BUILDING: "text-blue-500 bg-blue-100",
  DEPLOYING: "text-indigo-500 bg-indigo-100",
  DEPLOYED: "text-green-500 bg-green-100",
  FAILED: "text-red-500 bg-red-100",
  ROLLED_BACK: "text-yellow-500 bg-yellow-100",
};
```

### Status Icons

```typescript
const statusIcons = {
  PENDING: "⏳",
  BUILDING: "🔨",
  DEPLOYING: "🚀",
  DEPLOYED: "✅",
  FAILED: "❌",
  ROLLED_BACK: "↩️",
};
```

---

## 🔄 Auto-Refresh Behavior

### Automatic Refresh

These hooks auto-refresh every 2 seconds when deployment is in progress:

- `useDeployment(id)` - Auto-refreshes
- `useLatestProjectDeployment(projectId)` - Auto-refreshes

### Manual Control

```typescript
// Disable auto-refresh
const { data } = useDeployment(id, { autoRefresh: false });
const { data } = useLatestProjectDeployment(projectId, false);
```

### When to Use Auto-Refresh

✅ **Use auto-refresh:**

- Deployment details page
- Latest deployment widget
- Real-time status monitoring

❌ **Disable auto-refresh:**

- Deployment list views
- Historical deployments
- Modal dialogs

---

## 🎯 Common Patterns

### Pattern 1: Deploy Button with Feedback

```typescript
function QuickDeployButton({ projectId }: { projectId: string }) {
  const { createDeployment } = useDeploymentMutations();
  const { toast } = useToast();

  const deploy = () => {
    createDeployment.mutate(
      {
        project_id: projectId,
        commit_hash: "HEAD", // Use latest commit
        branch: "main",
      },
      {
        onSuccess: (deployment) => {
          toast({
            title: "Deployment Started",
            description: `Deployment ${deployment.id} is now building...`,
          });
        },
        onError: (error) => {
          toast({
            title: "Deployment Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Button onClick={deploy} disabled={createDeployment.isPending}>
      {createDeployment.isPending ? (
        <>
          <Spinner className="mr-2" />
          Creating...
        </>
      ) : (
        <>
          <RocketIcon className="mr-2" />
          Deploy
        </>
      )}
    </Button>
  );
}
```

### Pattern 2: Live Deployment Monitor

```typescript
function LiveDeploymentMonitor({ deploymentId }: { deploymentId: string }) {
  const { data: deployment, isLoading } = useDeployment(deploymentId);

  if (isLoading) return <Skeleton className="h-64" />;
  if (!deployment) return <div>Deployment not found</div>;

  const inProgress = isDeploymentInProgress(deployment.status!);
  const statusColor = getDeploymentStatusColor(deployment.status!);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Monitor</CardTitle>
        <CardDescription>
          {inProgress && (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Deployment in progress...
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={statusColor}>{deployment.status}</Badge>
          </div>

          <div>
            <span className="text-sm font-medium">Commit:</span>
            <code className="ml-2 text-sm">{deployment.commit_hash}</code>
          </div>

          <div>
            <span className="text-sm font-medium">Branch:</span>
            <span className="ml-2 text-sm">{deployment.branch}</span>
          </div>

          <div>
            <span className="text-sm font-medium block mb-2">Logs:</span>
            <ScrollArea className="h-96 w-full rounded border bg-black text-green-400 p-4">
              <pre className="text-xs whitespace-pre-wrap">
                {deployment.logs || "No logs yet..."}
              </pre>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Pattern 3: Deployment History Table

```typescript
import { useProjectDeployments } from "@/hooks/useDeployments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DeploymentHistory({ projectId }: { projectId: string }) {
  const { data, isLoading } = useProjectDeployments(projectId, 1, 50);

  if (isLoading) return <TableSkeleton />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Commit</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.deployments?.map((deployment) => (
          <TableRow key={deployment.id}>
            <TableCell>
              <Badge className={getDeploymentStatusColor(deployment.status!)}>
                {deployment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <code className="text-sm">{deployment.commit_hash}</code>
            </TableCell>
            <TableCell>{deployment.branch}</TableCell>
            <TableCell>
              {new Date(deployment.created_at!).toLocaleString()}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/deployments/${deployment.id}`)}
              >
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Pattern 4: Deployment Status Indicator

```typescript
import {
  useLatestProjectDeployment,
  isDeploymentInProgress,
} from "@/hooks/useDeployments";

function ProjectStatusIndicator({ projectId }: { projectId: string }) {
  const { data: deployment } = useLatestProjectDeployment(projectId);

  if (!deployment) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="h-2 w-2 rounded-full bg-gray-300" />
        <span className="text-sm">Never deployed</span>
      </div>
    );
  }

  const inProgress = isDeploymentInProgress(deployment.status!);
  const color =
    deployment.status === "DEPLOYED"
      ? "bg-green-500"
      : deployment.status === "FAILED"
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-2 w-2 rounded-full ${color} ${
          inProgress ? "animate-pulse" : ""
        }`}
      />
      <span className="text-sm">{deployment.status}</span>
    </div>
  );
}
```

---

## 🎨 Type-Safe Constants

Use these exported constants for type safety:

```typescript
import {
  DEPLOYMENT_STATUSES,
  DEPLOYMENT_STATUS_LABELS,
  DEPLOYMENT_STATUS_ICONS,
  type DeploymentStatus,
} from "@/types/deployment";

// All valid statuses
DEPLOYMENT_STATUSES.forEach((status) => {
  console.log(DEPLOYMENT_STATUS_LABELS[status]); // Human-readable
  console.log(DEPLOYMENT_STATUS_ICONS[status]); // Emoji icon
});
```

---

## 🔔 Error Handling

All hooks include error handling. Access errors via:

```typescript
const { error, isError } = useDeployment(id);

if (isError) {
  return <Alert variant="destructive">{error.message}</Alert>;
}
```

---

## 📊 Loading States

All hooks provide loading states:

```typescript
const { isLoading, isFetching } = useDeployment(id);

if (isLoading) return <Skeleton />;
// or
<Button disabled={createDeployment.isPending}>...</Button>;
```

---

## ♻️ Cache Management

The hooks automatically manage React Query cache:

- ✅ **Invalidation** - Lists refresh after mutations
- ✅ **Optimistic Updates** - Status changes update cache immediately
- ✅ **Auto-Refresh** - In-progress deployments refresh automatically

You don't need to manually refetch!

---

## 🚀 Quick Start Checklist

- [ ] Import the hook you need
- [ ] Use in your component
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Display the data
- [ ] (Optional) Add auto-refresh for in-progress deployments

---

## 📝 Type Definitions

All types are exported from `@/types/deployment`:

```typescript
type Deployment = {
  id: string;
  project_id: string;
  user_id: string;
  commit_hash: string;
  branch: string;
  status:
    | "PENDING"
    | "BUILDING"
    | "DEPLOYING"
    | "DEPLOYED"
    | "FAILED"
    | "ROLLED_BACK";
  logs: string;
  created_at: string;
  updated_at: string;
};

type CreateDeploymentRequest = {
  project_id: string;
  commit_hash: string;
  branch: string;
};

type DeploymentListResponse = {
  deployments: Deployment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};
```

---

**All hooks are ready to use! Start building the UI components! 🎨**

