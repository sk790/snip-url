import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="analytics-modal glass-card" style={{ maxWidth: "400px", textAlign: "center" }}>
        <div className="modal-header" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--error)" }}>
            <AlertTriangle size={28} />
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h2>
          </div>
          <button onClick={onClose} className="btn-icon-small">
            <X size={24} />
          </button>
        </div>

        <p style={{ color: "var(--text-main)", marginBottom: "2rem", lineHeight: "1.6" }}>
          {message}
        </p>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={onClose} 
            className="btn-login" 
            style={{ flex: 1, justifyContent: "center" }}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="btn-primary" 
            style={{ 
              flex: 1, 
              background: "var(--error)", 
              color: "#fff",
              padding: "0.8rem",
              fontSize: "1rem",
              borderRadius: "12px",
              justifyContent: "center"
            }}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
