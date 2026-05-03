import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import {
  Activity,
  Copy,
  Check,
  ExternalLink,
  Search,
  Calendar,
  LayoutDashboard,
  ArrowLeft,
  Trash2,
  Plus,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Settings,
  QrCode,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Edit3,
  X,
} from "lucide-react";
import { AnalyticsModal } from "./AnalyticsModal";
import { ConfirmModal } from "./ConfirmModal";

export const Dashboard = () => {
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [analyticsCode, setAnalyticsCode] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [backendStats, setBackendStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    protected: 0,
  });
  const [limit, setLimit] = useState(10);
  const [isLimitDropdownOpen, setIsLimitDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLimitDropdownOpen(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUrls = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/urls?status=${statusFilter === "all" ? "" : statusFilter}&search=${searchTerm}&type=${typeFilter === "all" ? "" : typeFilter}&page=${currentPage}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUrls(response.data.urls);
      setTotalPages(response.data.pages);
      setBackendStats(response.data.stats);
    } catch (err) {
      console.error("Failed to fetch URLs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const timeoutId = setTimeout(() => {
      fetchUrls();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchTerm, currentPage, limit, typeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, limit, typeFilter]);

  const handleCopy = (shortUrl: string, index: number) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3000/api/urls/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUrls((prev) => prev.filter((u) => u._id !== deletingId));
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete URL", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLogoutModalOpen(false);
    window.location.href = "/";
  };

  const stats = backendStats;

  return (
    <div className="dashboard-page">
      <div className="ambient-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <Link to="/" className="back-link">
            <ArrowLeft size={20} />
            <span>Home</span>
          </Link>

          <div
            className="nav-links"
            style={{ display: "flex", gap: "2rem", alignItems: "center" }}
          >
            <Link
              to="/dashboard"
              className="nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--primary)",
                fontWeight: "600",
                textDecoration: "none",
                borderBottom: "2px solid var(--primary)",
                paddingBottom: "0.2rem",
              }}
            >
              <LayoutDashboard size={18} /> Overview
            </Link>
            <Link
              to="#"
              className="nav-link hover-opacity"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-main)",
                opacity: "0.7",
                textDecoration: "none",
                transition: "opacity 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <Activity size={18} /> Analytics
            </Link>
            <Link
              to="#"
              className="nav-link hover-opacity"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-main)",
                opacity: "0.7",
                textDecoration: "none",
                transition: "opacity 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <Settings size={18} /> Settings
            </Link>
          </div>
          <div
            className="user-info"
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "6px" }}
            >
              <span className="welcome-text">Welcome back,</span>
              <span className="user-name-large">{user?.name || "User"}</span>
            </div>
            <button
              onClick={handleLogoutClick}
              className="btn-logout"
              title="Logout"
              style={{ width: "36px", height: "36px", marginLeft: "12px" }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <header className="dashboard-header-large">
          <div className="header-main">
            <div className="title-area">
              <LayoutDashboard size={40} className="header-icon" />
              <div>
                <h1>
                  Link <span className="text-gradient">Analytics</span>
                </h1>
                <p className="header-subtitle">
                  Manage and track your shortened URLs in real-time.
                </p>
              </div>
            </div>
            <Link to="/" className="btn-create-new">
              <Plus size={20} />
              <span>Create New Link</span>
            </Link>
          </div>
        </header>

        <div className="stats-grid-4">
          <div className="stat-card-premium glass-card">
            <div className="stat-icon-wrapper blue">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Links</span>
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card-premium glass-card">
            <div className="stat-icon-wrapper green">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Active</span>
              <span className="stat-value">{stats.active}</span>
            </div>
          </div>
          <div className="stat-card-premium glass-card">
            <div className="stat-icon-wrapper orange">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Expired</span>
              <span className="stat-value">{stats.expired}</span>
            </div>
          </div>
          <div className="stat-card-premium glass-card">
            <div className="stat-icon-wrapper purple">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Password Protected</span>
              <span className="stat-value">{stats.protected}</span>
            </div>
          </div>
        </div>

        <div className="links-container-full glass-card">
          <div className="container-header">
            <h2 className="section-title">My Links</h2>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                className="filter-group-premium"
                style={{
                  display: "flex",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  padding: "4px",
                }}
              >
                <button
                  onClick={() => setStatusFilter("all")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      statusFilter === "all" ? "var(--primary)" : "transparent",
                    color: statusFilter === "all" ? "black" : "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "0.3s",
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      statusFilter === "active"
                        ? "var(--primary)"
                        : "transparent",
                    color: statusFilter === "active" ? "black" : "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "0.3s",
                  }}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter("expired")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      statusFilter === "expired"
                        ? "var(--primary)"
                        : "transparent",
                    color: statusFilter === "expired" ? "black" : "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    transition: "0.3s",
                  }}
                >
                  Expired
                </button>
              </div>

              <div
                className="custom-select-container"
                ref={typeDropdownRef}
                style={{ width: "160px", margin: 0 }}
              >
                <div
                  className="custom-select-trigger"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "10px 16px",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>
                    {typeFilter === "all"
                      ? "All Types"
                      : typeFilter.charAt(0).toUpperCase() +
                        typeFilter.slice(1)}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: isTypeDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "0.3s",
                      opacity: 0.5,
                    }}
                  />
                </div>
                {isTypeDropdownOpen && (
                  <div
                    className="custom-select-options"
                    style={{
                      width: "100%",
                      top: "calc(100% + 8px)",
                      zIndex: 100,
                    }}
                  >
                    {[
                      { value: "all", label: "All Types" },
                      { value: "protected", label: "Protected" },
                      { value: "expiry", label: "With Expiry" },
                      { value: "qr", label: "QR Links" },
                      { value: "custom", label: "Custom Links" },
                      { value: "normal", label: "Normal" },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={`custom-select-option ${typeFilter === opt.value ? "active" : ""}`}
                        onClick={() => {
                          setTypeFilter(opt.value);
                          setIsTypeDropdownOpen(false);
                        }}
                        style={{ padding: "10px 16px", fontSize: "0.9rem" }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="search-bar-premium">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search links by URL or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state-full">
              <div className="spinner-large"></div>
              <span>Fetching your data...</span>
            </div>
          ) : urls.length === 0 ? (
            <div className="empty-state-full">
              <AlertCircle size={48} className="empty-icon" />
              <p>
                {searchTerm
                  ? "No results found for your search."
                  : "You haven't created any links yet."}
              </p>
              {!searchTerm && (
                <Link
                  to="/"
                  className="btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Get Started
                </Link>
              )}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short Code</th>
                    <th>Type</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url, index) => {
                    const isExpired =
                      url.expiresAt && new Date(url.expiresAt) < new Date();
                    return (
                      <tr key={url._id}>
                        <td className="url-td">
                          <div className="url-display" title={url.originalUrl}>
                            {url.originalUrl}
                          </div>
                        </td>
                        <td>
                          <div className="code-display">
                            <code>{url.urlCode}</code>
                            <button
                              onClick={() => handleCopy(url.shortUrl, index)}
                              className="btn-copy-mini"
                            >
                              {copiedIndex === index ? (
                                <Check size={14} className="text-success" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div
                            className="type-tags"
                            style={{
                              display: "flex",
                              gap: "6px",
                              flexWrap: "wrap",
                            }}
                          >
                            {url.password && (
                              <span
                                className="type-tag"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(168, 85, 247, 0.1)",
                                  color: "#a855f7",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.7rem",
                                  fontWeight: "600",
                                  border: "1px solid rgba(168, 85, 247, 0.2)",
                                }}
                              >
                                <ShieldCheck size={12} /> PROTECTED
                              </span>
                            )}
                            {url.expiresAt && (
                              <span
                                className="type-tag"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(249, 115, 22, 0.1)",
                                  color: "#f97316",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.7rem",
                                  fontWeight: "600",
                                  border: "1px solid rgba(249, 115, 22, 0.2)",
                                }}
                              >
                                <Clock size={12} /> EXPIRY
                              </span>
                            )}
                            {url.isQr && (
                              <span
                                className="type-tag"
                                onClick={() => {
                                  setQrModalUrl(url.shortUrl);
                                  setQrModalOpen(true);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(34, 197, 94, 0.1)",
                                  color: "#22c55e",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.7rem",
                                  fontWeight: "600",
                                  border: "1px solid rgba(34, 197, 94, 0.2)",
                                  cursor: "pointer",
                                }}
                                title="Click to view QR Code"
                              >
                                <QrCode size={12} /> QR
                              </span>
                            )}
                            {url.isCustom && (
                              <span
                                className="type-tag"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(236, 72, 153, 0.1)",
                                  color: "#ec4899",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  fontSize: "0.7rem",
                                  fontWeight: "600",
                                  border: "1px solid rgba(236, 72, 153, 0.2)",
                                }}
                              >
                                <Edit3 size={12} /> CUSTOM
                              </span>
                            )}
                            {!url.password &&
                              !url.expiresAt &&
                              !url.isQr &&
                              !url.isCustom && (
                                <span
                                  className="type-tag"
                                  style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    color: "rgba(255, 255, 255, 0.4)",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    fontSize: "0.7rem",
                                    fontWeight: "600",
                                    border:
                                      "1px solid rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  NORMAL
                                </span>
                              )}
                          </div>
                        </td>
                        <td>
                          <div
                            className="clicks-display"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontWeight: "600",
                            }}
                          >
                            <TrendingUp size={14} className="text-primary" />
                            {url.clicks || 0}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${isExpired ? "expired" : "active"}`}
                          >
                            {isExpired ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="date-display">
                            <Calendar size={14} />
                            {new Date(url.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="actions-row">
                            <button
                              onClick={() => setAnalyticsCode(url.urlCode)}
                              className="btn-action"
                              title="View Analytics"
                            >
                              <Activity size={18} />
                            </button>
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-action"
                              title="Open Link"
                            >
                              <ExternalLink size={18} />
                            </a>
                            <button
                              onClick={() => handleDeleteClick(url._id)}
                              className="btn-action btn-delete"
                              title="Delete Link"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {urls.length > 0 && (
            <div
              className="pagination-premium"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                marginTop: "2rem",
                paddingBottom: "1rem",
              }}
            >
              <div
                className="pagination-info"
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "2rem",
                }}
              >
                <span>
                  Showing Page {currentPage} of {totalPages || 1}
                </span>

                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <button
                    onClick={() => setIsLimitDropdownOpen(!isLimitDropdownOpen)}
                    className="custom-select-trigger"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "var(--primary)",
                      border: "1px solid rgba(102, 252, 241, 0.2)",
                      borderRadius: "10px",
                      padding: "6px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      cursor: "pointer",
                      fontWeight: "700",
                      transition: "all 0.3s ease",
                      minWidth: "80px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{limit}</span>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: isLimitDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "0.3s",
                      }}
                    />
                  </button>

                  {isLimitDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        background: "#1a1d23",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "14px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                        zIndex: 1000,
                        overflow: "hidden",
                        animation: "fadeInUp 0.2s ease-out",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      {[5, 10, 20, 50, 100].map((val) => (
                        <div
                          key={val}
                          onClick={() => {
                            setLimit(val);
                            setIsLimitDropdownOpen(false);
                          }}
                          className={`custom-select-option ${limit === val ? "active" : ""}`}
                        >
                          {val}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="btn-pagination"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    padding: "8px",
                    borderRadius: "8px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`btn-page ${currentPage === p ? "active" : ""}`}
                        style={{
                          minWidth: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border: "none",
                          background:
                            currentPage === p
                              ? "var(--primary)"
                              : "rgba(255,255,255,0.05)",
                          color: currentPage === p ? "black" : "white",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "0.3s",
                        }}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || totalPages <= 1}
                  className="btn-pagination"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "white",
                    padding: "8px",
                    borderRadius: "8px",
                    cursor:
                      currentPage === totalPages || totalPages <= 1
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      currentPage === totalPages || totalPages <= 1 ? 0.5 : 1,
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {analyticsCode && (
        <AnalyticsModal
          urlCode={analyticsCode}
          onClose={() => setAnalyticsCode(null)}
        />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this link? This action cannot be undone."
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
      />

      {qrModalOpen && (
        <div className="modal-overlay" onClick={() => setQrModalOpen(false)}>
          <div
            className="modal-content glass-card qr-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "400px" }}
          >
            <button
              className="modal-close"
              onClick={() => setQrModalOpen(false)}
            >
              <X size={18} />
            </button>
            <div className="qr-container-premium">
              <h3>Scan QR Code</h3>
              <div
                style={{
                  background: "white",
                  padding: "1.2rem",
                  borderRadius: "20px",
                  display: "inline-block",
                  marginBottom: "1.5rem",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                }}
              >
                <QRCodeSVG
                  value={qrModalUrl}
                  size={220}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <p
                style={{
                  color: "var(--text-main)",
                  fontSize: "0.9rem",
                  wordBreak: "break-all",
                  opacity: 0.6,
                  marginBottom: "1.5rem",
                }}
              >
                {qrModalUrl}
              </p>

              <button
                onClick={() => {
                  const svg = document.querySelector(
                    ".qr-container-premium svg",
                  ) as SVGGraphicsElement;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx?.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.download = "qr-code.png";
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  img.src = "data:image/svg+xml;base64," + btoa(svgData);
                }}
                className="btn-primary"
                style={{ marginTop: "1.5rem", width: "100%", padding: "12px" }}
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
