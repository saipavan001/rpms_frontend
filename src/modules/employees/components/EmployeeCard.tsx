import type { Employee } from '../types/employee';

type EmployeeCardProps = {
  item: Employee;
  onEdit: (item: Employee) => void;
  onDelete: (item: Employee) => void;
};

const EmployeeCard = ({ item, onEdit, onDelete }: EmployeeCardProps) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs text-slate-400">{item.employee_code}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-white">
            {item.employee_name}
          </h3>
          <p className="mt-1 truncate text-xs text-slate-400">
            {item.email_official}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {item.organization_unit.name} · {item.employment_type}
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

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex-1 rounded-lg border border-white/10 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
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
    </div>
  );
};

export default EmployeeCard;
