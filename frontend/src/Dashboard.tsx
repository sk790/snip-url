import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  AlertCircle
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

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const fetchUrls = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:3000/api/urls", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUrls(response.data);
      } catch (err) {
        console.error("Failed to fetch URLs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUrls();
  }, []);

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
        headers: { Authorization: `Bearer ${token}` }
      });
      setUrls(prev => prev.filter(u => u._id !== deletingId));
      setDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete URL", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.urlCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: urls.length,
    active: urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length,
    expired: urls.filter(u => u.expiresAt && new Date(u.expiresAt) < new Date()).length,
    protected: urls.filter(u => u.password).length
  };

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
            <span>Back to Home</span>
          </Link>
          <div className="user-info">
            <span className="welcome-text">Welcome back,</span>
            <span className="user-name-large">{user?.name || "User"}</span>
          </div>
        </nav>

        <header className="dashboard-header-large">
          <div className="header-main">
            <div className="title-area">
              <LayoutDashboard size={40} className="header-icon" />
              <div>
                <h1>Link <span className="text-gradient">Analytics</span></h1>
                <p className="header-subtitle">Manage and track your shortened URLs in real-time.</p>
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

          {loading ? (
            <div className="loading-state-full">
              <div className="spinner-large"></div>
              <span>Fetching your data...</span>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="empty-state-full">
              <AlertCircle size={48} className="empty-icon" />
              <p>{searchTerm ? "No results found for your search." : "You haven't created any links yet."}</p>
              {!searchTerm && <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>Get Started</Link>}
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short Code</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUrls.map((url, index) => {
                    const isExpired = url.expiresAt && new Date(url.expiresAt) < new Date();
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
                            <button onClick={() => handleCopy(url.shortUrl, index)} className="btn-copy-mini">
                              {copiedIndex === index ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${isExpired ? 'expired' : 'active'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="date-display">
                            <Calendar size={14} />
                            {new Date(url.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="actions-row">
                            <button onClick={() => setAnalyticsCode(url.urlCode)} className="btn-action" title="View Analytics">
                              <Activity size={18} />
                            </button>
                            <a href={url.shortUrl} target="_blank" rel="noreferrer" className="btn-action" title="Open Link">
                              <ExternalLink size={18} />
                            </a>
                            <button onClick={() => handleDeleteClick(url._id)} className="btn-action btn-delete" title="Delete Link">
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
        </div>
      </div>

      {analyticsCode && (
        <AnalyticsModal urlCode={analyticsCode} onClose={() => setAnalyticsCode(null)} />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this link? This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
};

