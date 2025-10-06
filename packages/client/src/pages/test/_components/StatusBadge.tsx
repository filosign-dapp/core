import { Badge } from "../../../lib/components/ui/badge";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@phosphor-icons/react";

interface StatusBadgeProps {
  status: boolean | undefined;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === undefined)
    return (
      <Badge variant="outline">
        <ClockIcon className="w-3 h-3 mr-1" />
        Loading
      </Badge>
    );
  return (
    <Badge variant={status ? "default" : "secondary"}>
      {status ? (
        <CheckCircleIcon className="w-3 h-3 mr-1" />
      ) : (
        <XCircleIcon className="w-3 h-3 mr-1" />
      )}
      {label}
    </Badge>
  );
}
