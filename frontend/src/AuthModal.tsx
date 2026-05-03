import React, { useState } from "react";
import axios from "axios";
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, Loader2 } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin ? { email, password } : { name, email, password };
      
      const response = await axios.post(`http://localhost:3000${endpoint}`, payload);
      
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
      
      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="analytics-modal glass-card" style={{ maxWidth: "450px" }}>
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-light)" }}>
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <button onClick={onClose} className="btn-icon-small">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {!isLogin && (
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input
                type="text"
                className="url-input"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-wrapper">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              className="url-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-wrapper">
            <Lock className="input-icon" size={20} />
            <input
              type="password"
              className="url-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="error-message" style={{ margin: 0 }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Login" : "Register")}
          </button>

          <p style={{ textAlign: "center", color: "var(--text-main)", fontSize: "0.9rem" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontWeight: 600,
                marginLeft: "5px",
              }}
            >
              {isLogin ? "Register Now" : "Login Instead"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};
