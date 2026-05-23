import { toast } from "react-hot-toast";

const baseOptions = {
  duration: 4500,
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

export const toastSuccess = (message) =>
  toast.success(message, {
    ...baseOptions,
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
    icon: "ℹ️",
    style: {
      ...baseOptions.style,
      background: "#f8fafc",
      color: "#0f172a",
      borderColor: "#cbd5e1",
    },
  });

export const toastPromise = (promise, messages) =>
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
