import type { ShareRole } from '../../types';

interface PermissionSelectorProps {
  value: ShareRole;
  onChange: (role: ShareRole) => void;
  /** Accessible name of the selector. */
  label: string;
  disabled?: boolean;
  className?: string;
}

/** The Viewer / Editor selector used in the share dialog. */
export function PermissionSelector({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}: PermissionSelectorProps) {
  return (
    <select
      className={`select ${className}`.trim()}
      value={value}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(event.target.value as ShareRole)}
    >
      <option value="viewer">Can view</option>
      <option value="editor">Can edit</option>
    </select>
  );
}

export default PermissionSelector;
