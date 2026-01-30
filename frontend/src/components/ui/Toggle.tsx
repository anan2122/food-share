interface ToggleProps {
  enabled?: boolean;
  checked?: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Toggle({ enabled, checked, onChange, label, description, disabled = false, size = 'md' }: ToggleProps) {
  const isEnabled = enabled ?? checked ?? false;
  
  const sizeClasses = {
    sm: { button: 'h-5 w-9', thumb: 'h-4 w-4', translate: 'translate-x-4' },
    md: { button: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
  };
  
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => !disabled && onChange(!isEnabled)}
        className={`relative inline-flex ${sizeClasses[size].button} flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          isEnabled ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span
          className={`pointer-events-none inline-block ${sizeClasses[size].thumb} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isEnabled ? sizeClasses[size].translate : 'translate-x-0'
          }`}
        />
      </button>
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}
    </div>
  );
}
