import type { OrgUnitTypeHierarchy } from '../types/org-unit-type-hierarchy';

type OrgUnitTypeHierarchyCardProps = {
  item: OrgUnitTypeHierarchy;
  onEdit: (item: OrgUnitTypeHierarchy) => void;
  onDelete: (item: OrgUnitTypeHierarchy) => void;
  canWrite?: boolean;
};

const OrgUnitTypeHierarchyCard = ({
  item,
  onEdit,
  onDelete,
  canWrite = true,
}: OrgUnitTypeHierarchyCardProps) => {
  return (
    <article className="app-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="app-label text-sm">
            <span className="font-mono app-muted text-xs">
              {item.parent_ou_type.code}
            </span>
            <span className="mx-2 text-slate-500">→</span>
            <span className="font-mono app-muted text-xs">
              {item.child_ou_type.code}
            </span>
          </p>
          <h3 className="mt-2 app-card-title text-base">
            {item.parent_ou_type.name} → {item.child_ou_type.name}
          </h3>
          {item.display_order !== null && (
            <p className="mt-1 app-muted text-xs">
              Display order: {item.display_order}
            </p>
          )}
        </div>
        <span
          className={
            item.is_active
              ? 'shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300'
              : 'shrink-0 rounded-full bg-slate-500/15 px-2.5 py-1 text-xs font-medium text-slate-400'
          }
        >
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {canWrite && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="app-btn-ghost flex-1 py-2 text-sm"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="flex-1 rounded-lg border border-red-500/30 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
};

export default OrgUnitTypeHierarchyCard;
