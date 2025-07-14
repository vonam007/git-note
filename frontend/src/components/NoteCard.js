import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPRStateClass = (state) => {
    switch (state) {
      case 'open':
        return 'pr-state-open';
      case 'closed':
        return 'pr-state-closed';
      case 'merged':
        return 'pr-state-merged';
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

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card note-card h-100">
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title text-truncate flex-grow-1 me-2">
              {note.title}
            </h5>
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                type="button" 
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-ellipsis-v"></i>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to={`/notes/${note.id}`}>
                    <i className="fas fa-eye me-2"></i>View
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to={`/notes/${note.id}/edit`}>
                    <i className="fas fa-edit me-2"></i>Edit
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={() => onDelete(note.id)}
                  >
                    <i className="fas fa-trash me-2"></i>Delete
                  </button>
                </li>
              </ul>
            </div>
          </div>
          
          <p className="card-text note-content text-muted flex-grow-1">
            {note.content}
          </p>
          
          {note.github_pr_number && (
            <div className="mb-2">
              <span className={`badge badge-pr bg-${getPRStateBadge(note.pr_state)} me-2`}>
                PR #{note.github_pr_number}
              </span>
              {note.pr_state && (
                <span className={`badge bg-light text-dark ${getPRStateClass(note.pr_state)}`}>
                  {note.pr_state.toUpperCase()}
                </span>
              )}
              <div className="small text-muted mt-1">
                {note.repo_owner}/{note.repo_name}
              </div>
            </div>
          )}
          
          <div className="mt-auto">
            <small className="text-muted">
              <i className="fas fa-clock me-1"></i>
              {formatDate(note.created_at)}
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
