import { Badge } from "@/components/ui/badge";
import {
  DEPLOYMENT_STATUS_LABELS,
  DEPLOYMENT_STATUS_ICONS,
  type DeploymentStatus,
} from "@/types/deployment";
import {
  getDeploymentStatusColor,
  isDeploymentInProgress,
} from "@/hooks/useDeployments";

interface DeploymentStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
}

export function DeploymentStatusBadge({
  status,
  showIcon = true,
  className = "",
}: DeploymentStatusBadgeProps) {
  const statusColor = getDeploymentStatusColor(status);
  const icon = DEPLOYMENT_STATUS_ICONS[status as DeploymentStatus];
  const label = DEPLOYMENT_STATUS_LABELS[status as DeploymentStatus] || status;
  const inProgress = isDeploymentInProgress(status);

  return (
    <Badge
      className={`${statusColor} ${className} ${
        inProgress ? "animate-pulse" : ""
      }`}
    >
      {showIcon && icon && <span className="mr-1">{icon}</span>}
      {label}
    </Badge>
  );
}

