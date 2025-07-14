import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { noteService } from '../services/noteService';
import LoadingSpinner from '../components/LoadingSpinner';

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await noteService.getNoteById(id);
      setNote(response.data);
    } catch (error) {
      toast.error('Failed to fetch note');
      console.error('Fetch note error:', error);
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await noteService.deleteNote(id);
      toast.success('Note deleted successfully');
      navigate('/notes');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Delete note error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPRStateClass = (state) => {
    switch (state) {
      case 'open':
        return 'text-success';
      case 'closed':
        return 'text-danger';
      case 'merged':
        return 'text-primary';
      default:
        return '';
    }
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
          <LoadingSpinner text="Loading note..." />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="content-wrapper">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Note not found</h4>
            <p>The note you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/notes" className="btn btn-primary">
              <i className="fas fa-arrow-left me-2"></i>
              Back to Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Navigation */}
            <nav aria-label="breadcrumb" className="mb-3">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/notes">Notes</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {note.title}
                </li>
              </ol>
            </nav>

            {/* Note Header */}
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h1 className="h3 mb-2">{note.title}</h1>
                    <div className="d-flex align-items-center gap-3 text-muted">
                      <small>
                        <i className="fas fa-clock me-1"></i>
                        Created {formatDate(note.created_at)}
                      </small>
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <small>
                          <i className="fas fa-edit me-1"></i>
                          Updated {formatDate(note.updated_at)}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-secondary dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                    >
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link className="dropdown-item" to={`/notes/${note.id}/edit`}>
                          <i className="fas fa-edit me-2"></i>Edit Note
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleDelete}>
                          <i className="fas fa-trash me-2"></i>Delete Note
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* GitHub PR Information */}
              {note.github_pr_number && (
                <div className="github-pr-info">
                  <h5 className="mb-3">
                    <i className="fab fa-github me-2"></i>
                    GitHub Pull Request Information
                  </h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-2">
                        <strong>Repository:</strong>{' '}
                        <a 
                          href={`https://github.com/${note.repo_owner}/${note.repo_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {note.repo_owner}/{note.repo_name}
                          <i className="fas fa-external-link-alt ms-1 small"></i>
                        </a>
                      </div>
                      <div className="mb-2">
                        <strong>PR Number:</strong>{' '}
                        <span className={`badge bg-${getPRStateBadge(note.pr_state)}`}>
                          #{note.github_pr_number}
                        </span>
                      </div>
                      {note.pr_state && (
                        <div className="mb-2">
                          <strong>Status:</strong>{' '}
                          <span className={`fw-bold ${getPRStateClass(note.pr_state)}`}>
                            {note.pr_state.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    {note.pr_url && (
                      <div className="col-md-6">
                        <div className="mb-2">
                          <strong>PR Link:</strong>{' '}
                          <a 
                            href={note.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="fab fa-github me-1"></i>
                            View on GitHub
                            <i className="fas fa-external-link-alt ms-1"></i>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {note.pr_title && (
                    <div className="mt-3">
                      <strong>PR Title:</strong>
                      <div className="bg-white p-2 rounded border mt-1">
                        {note.pr_title}
                      </div>
                    </div>
                  )}
                  
                  {note.pr_author && (
                    <div className="mt-2">
                      <strong>Author:</strong>{' '}
                      <a 
                        href={`https://github.com/${note.pr_author}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        @{note.pr_author}
                        <i className="fas fa-external-link-alt ms-1 small"></i>
                      </a>
                    </div>
                  )}
                  
                  {note.pr_created_at && (
                    <div className="mt-2">
                      <strong>PR Created:</strong>{' '}
                      {formatDate(note.pr_created_at)}
                    </div>
                  )}
                </div>
              )}

              {/* Note Content */}
              <div className="card-body">
                <div className="note-content-display">
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                    {note.content}
                  </div>
                </div>
              </div>

              {/* Note Footer */}
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Note ID: {note.id}
                  </small>
                  <div className="d-flex gap-2">
                    <Link to="/notes" className="btn btn-outline-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Notes
                    </Link>
                    <Link to={`/notes/${note.id}/edit`} className="btn btn-primary">
                      <i className="fas fa-edit me-2"></i>
                      Edit Note
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
