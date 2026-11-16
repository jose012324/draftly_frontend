import { useToast } from '../../context/ToastContext';
import { Icon } from './Icon';

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const iconName =
          toast.variant === 'success' ? 'check' : toast.variant === 'error' ? 'alert' : 'info';

        return (
          <div key={toast.id} className={`toast toast--${toast.variant}`}>
            <span className="toast__icon">
              <Icon name={iconName} size={13} strokeWidth={2.6} />
            </span>
            <span className="toast__message">{toast.message}</span>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastViewport;
