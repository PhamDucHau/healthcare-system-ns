import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPermissionCategoryLabel,
  getPermissionDisplayName,
  groupPermissionsByCategory,
} from "@/config/rbac-permissions";

export type RolePermission = {
  id: string;
  slug: string;
  name: string;
  category: string;
};

const COLLAPSE_THRESHOLD = 6;

function PermissionBadge({ permission }: { permission: RolePermission }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className="text-xs font-normal cursor-default">
          {getPermissionDisplayName(permission)}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-xs text-muted-foreground">
        {permission.slug}
      </TooltipContent>
    </Tooltip>
  );
}

function GroupedPermissions({ grouped }: { grouped: [string, RolePermission[]][] }) {
  return (
    <div className="space-y-2.5">
      {grouped.map(([category, perms]) => (
        <div key={category}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            {getPermissionCategoryLabel(category)}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {perms.map((p) => (
              <PermissionBadge key={p.id} permission={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type RolePermissionsSummaryProps = {
  permissions: RolePermission[];
};

const RolePermissionsSummary = ({ permissions }: RolePermissionsSummaryProps) => {
  const grouped = useMemo(
    () => groupPermissionsByCategory(permissions),
    [permissions],
  );
  const [expanded, setExpanded] = useState(false);

  if (permissions.length === 0) {
    return <span className="text-xs text-muted-foreground">Không có quyền hạn</span>;
  }

  const categoryCount = grouped.length;
  const shouldCollapse = permissions.length > COLLAPSE_THRESHOLD;

  if (!shouldCollapse) {
    return (
      <TooltipProvider delayDuration={300}>
        <GroupedPermissions grouped={grouped} />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>
              {permissions.length} quyền · {categoryCount} nhóm
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            <span className="text-primary font-medium">
              {expanded ? "Thu gọn" : "Xem chi tiết"}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <GroupedPermissions grouped={grouped} />
        </CollapsibleContent>
      </Collapsible>
    </TooltipProvider>
  );
};

export default RolePermissionsSummary;
