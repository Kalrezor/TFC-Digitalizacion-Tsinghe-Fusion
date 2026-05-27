import { toast } from "react-hot-toast";

const baseOptions = {
  duration: 3000,
  position: "top-right",
  style: {
    borderRadius: "1rem",
    padding: "0.9rem 1rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
};

const toastId = (type, message) => `${type}:${message}`;

export const toastSuccess = (message) =>
  toast.success(message, {
    ...baseOptions,
    id: toastId("success", message),
    icon: "✅",
    style: {
      ...baseOptions.style,
      background: "#ecfdf5",
      color: "#164e63",
      borderColor: "#a7f3d0",
    },
  });

export const toastError = (message) =>
  toast.error(message, {
    ...baseOptions,
    id: toastId("error", message),
    icon: "❌",
    style: {
      ...baseOptions.style,
      background: "#fee2e2",
      color: "#7f1d1d",
      borderColor: "#fecaca",
    },
  });

export const toastInfo = (message) =>
  toast(message, {
    ...baseOptions,
    id: toastId("info", message),
    icon: "ℹ️",
    style: {
      ...baseOptions.style,
      background: "#f8fafc",
      color: "#0f172a",
      borderColor: "#cbd5e1",
    },
  });

export const toastConfirm = (message, options = {}) =>
  new Promise((resolve) => {
    const {
      confirmText = "Confirmar",
      cancelText = "Cancelar",
    } = options;

    toast.custom(
      (t) => (
        <div
          style={{
            ...baseOptions.style,
            background: "#fff7ed",
            color: "#7c2d12",
            borderColor: "#fed7aa",
            maxWidth: "360px",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>{message}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              style={{
                border: "1px solid #fdba74",
                background: "#fff",
                color: "#7c2d12",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 700,
                padding: "0.45rem 0.7rem",
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              style={{
                border: "1px solid #dc2626",
                background: "#dc2626",
                color: "#fff",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 700,
                padding: "0.45rem 0.7rem",
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      {
        ...baseOptions,
        id: toastId("confirm", message),
        duration: Infinity,
      },
    );
  });

export const toastPromise = (promise, messages) =>
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
