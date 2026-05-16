import type { OrganizationUnit } from '../types/organization-unit';

type OrganizationUnitCardProps = {
  item: OrganizationUnit;
  onEdit: (item: OrganizationUnit) => void;
  onDelete: (item: OrganizationUnit) => void;
  canWrite?: boolean;
};

const OrganizationUnitCard = ({
  item,
  onEdit,
  onDelete,
  canWrite = true,
}: OrganizationUnitCardProps) => {
  return (
    <div className="app-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono app-muted text-xs">{item.code}</p>
          <h3 className="mt-1 truncate app-card-title text-base">
            {item.name}
          </h3>
          <p className="mt-1 app-muted text-xs">
            Type: {item.ou_type.name}
            {item.parent_ou ? ` · Parent: ${item.parent_ou.name}` : ''}
          </p>
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

      {item.description && (
        <p className="mt-3 line-clamp-2 app-muted text-sm">
          {item.description}
        </p>
      )}

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
    </div>
  );
};

export default OrganizationUnitCard;
