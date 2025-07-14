import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { noteService } from '../services/noteService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalNotes: 0,
    notesWithPR: 0,
    recentNotes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent notes (limit 5)
      const response = await noteService.getNotes({ limit: 5, page: 1 });
      const notes = response.data || [];
      
      // Calculate stats
      const totalNotes = response.pagination?.total || notes.length;
      const notesWithPR = notes.filter(note => note.github_pr_number).length;
      
      setStats({
        totalNotes,
        notesWithPR,
        recentNotes: notes
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPRStateBadge = (state) => {
    switch (state) {
      case 'open':
        return 'success';
      case 'closed':
        return 'danger';
      case 'merged':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="container">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="h2 mb-2">
              <i className="fas fa-tachometer-alt me-2 text-primary"></i>
              Dashboard
            </h1>
            <p className="text-muted">
              Welcome back, {user?.email}! Here's an overview of your notes.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{stats.totalNotes}</h3>
                    <p className="mb-0 opacity-75">Total Notes</p>
                  </div>
                  <i className="fas fa-sticky-note fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">{stats.notesWithPR}</h3>
                    <p className="mb-0 opacity-75">Notes with PRs</p>
                  </div>
                  <i className="fab fa-github fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0">
                      {user?.has_github_token ? 'Connected' : 'Not Set'}
                    </h3>
                    <p className="mb-0 opacity-75">GitHub Profile</p>
                  </div>
                  <i className="fas fa-user-cog fa-2x opacity-75"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row mb-4">
          <div className="col">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h5>
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <Link to="/notes/create" className="btn btn-primary w-100">
                      <i className="fas fa-plus me-2"></i>
                      New Note
                    </Link>
                  </div>
                  <div className="col-md-3 mb-2">
                    <Link to="/notes" className="btn btn-outline-primary w-100">
                      <i className="fas fa-list me-2"></i>
                      View All Notes
                    </Link>
                  </div>
                  <div className="col-md-3 mb-2">
                    <Link to="/profile" className="btn btn-outline-secondary w-100">
                      <i className="fas fa-user-cog me-2"></i>
                      Profile Settings
                    </Link>
                  </div>
                  <div className="col-md-3 mb-2">
                    <Link to="/notes?search=" className="btn btn-outline-info w-100">
                      <i className="fas fa-search me-2"></i>
                      Search Notes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Profile Status */}
        {(!user?.github_username || !user?.has_github_token) && (
          <div className="row mb-4">
            <div className="col">
              <div className="alert alert-warning" role="alert">
                <h5 className="alert-heading">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  GitHub Profile Not Configured
                </h5>
                <p className="mb-2">
                  To create notes with GitHub PR integration, you need to configure your GitHub profile.
                </p>
                <Link to="/profile" className="btn btn-warning">
                  <i className="fas fa-cog me-2"></i>
                  Configure Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Notes */}
        <div className="row">
          <div className="col">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Recent Notes
                </h5>
                <Link to="/notes" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {stats.recentNotes.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-sticky-note"></i>
                    <h5>No notes yet</h5>
                    <p>Create your first note to get started!</p>
                    <Link to="/notes/create" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>
                      Create Note
                    </Link>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {stats.recentNotes.map((note) => (
                      <div key={note.id} className="list-group-item border-0 px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <Link 
                              to={`/notes/${note.id}`} 
                              className="text-decoration-none"
                            >
                              <h6 className="mb-1">{note.title}</h6>
                            </Link>
                            <p className="mb-1 text-muted small">
                              {note.content.length > 100 
                                ? `${note.content.substring(0, 100)}...` 
                                : note.content
                              }
                            </p>
                            <div className="d-flex align-items-center gap-2">
                              <small className="text-muted">
                                {formatDate(note.created_at)}
                              </small>
                              {note.github_pr_number && (
                                <span className={`badge bg-${getPRStateBadge(note.pr_state)} small`}>
                                  PR #{note.github_pr_number}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link 
                            to={`/notes/${note.id}`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
