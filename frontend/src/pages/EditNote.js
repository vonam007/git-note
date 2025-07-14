import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { noteService } from '../services/noteService';
import LoadingSpinner from '../components/LoadingSpinner';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    github_pr_number: '',
    repo_owner: '',
    repo_name: ''
  });

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await noteService.getNoteById(id);
      const noteData = response.data;
      setNote(noteData);
      setFormData({
        title: noteData.title || '',
        content: noteData.content || '',
        github_pr_number: noteData.github_pr_number || '',
        repo_owner: noteData.repo_owner || '',
        repo_name: noteData.repo_name || ''
      });
    } catch (error) {
      toast.error('Failed to fetch note');
      console.error('Fetch note error:', error);
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSaving(true);

    try {
      // Prepare data for submission
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };

      // Add GitHub PR data if provided (and different from original)
      if (formData.github_pr_number) {
        noteData.github_pr_number = parseInt(formData.github_pr_number);
        noteData.repo_owner = formData.repo_owner.trim();
        noteData.repo_name = formData.repo_name.trim();
      }

      await noteService.updateNote(id, noteData);
      toast.success('Note updated successfully!');
      navigate(`/notes/${id}`);
    } catch (error) {
      let errorMessage = 'Failed to update note';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'The GitHub repository or PR number you specified was not found. Please check the repository name and PR number.';
      } else if (error.response?.status === 401) {
        errorMessage = 'GitHub authentication failed. Please check your GitHub token in Profile settings.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied to the GitHub repository. Please ensure your token has the required permissions or the repository is public.';
      }
      
      toast.error(errorMessage);
      console.error('Update note error:', error);
    } finally {
      setSaving(false);
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
            <p>The note you're trying to edit doesn't exist or you don't have permission to edit it.</p>
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
                <li className="breadcrumb-item">
                  <Link to={`/notes/${note.id}`}>{note.title}</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Edit
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 mb-1">
                  <i className="fas fa-edit me-2 text-primary"></i>
                  Edit Note
                </h1>
                <p className="text-muted mb-0">
                  Last updated: {formatDate(note.updated_at || note.created_at)}
                </p>
              </div>
              <Link to={`/notes/${note.id}`} className="btn btn-outline-secondary">
                <i className="fas fa-times me-2"></i>
                Cancel
              </Link>
            </div>

            {/* Edit Note Form */}
            <div className="card">
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Basic Note Information */}
                  <div className="mb-4">
                    <h5 className="card-title mb-3">
                      <i className="fas fa-sticky-note me-2"></i>
                      Note Information
                    </h5>
                    
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        placeholder="Note Title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength="255"
                        required
                      />
                      <label htmlFor="title">
                        <i className="fas fa-heading me-2"></i>Note Title *
                      </label>
                      <div className="form-text">
                        {formData.title.length}/255 characters
                      </div>
                    </div>

                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        placeholder="Note Content"
                        value={formData.content}
                        onChange={handleChange}
                        style={{ height: '200px' }}
                        required
                      />
                      <label htmlFor="content">
                        <i className="fas fa-align-left me-2"></i>Note Content *
                      </label>
                      <div className="form-text">
                        You can use plain text or Markdown formatting
                      </div>
                    </div>
                  </div>

                  {/* GitHub PR Integration */}
                  <div className="mb-4">
                    <h5 className="card-title mb-3">
                      <i className="fab fa-github me-2"></i>
                      GitHub PR Integration
                    </h5>
                    
                    {note.github_pr_number ? (
                      <div className="alert alert-info" role="alert">
                        <h6 className="alert-heading">
                          <i className="fab fa-github me-2"></i>
                          Current PR Information
                        </h6>
                        <p className="mb-2">
                          This note is linked to PR #{note.github_pr_number} in {note.repo_owner}/{note.repo_name}
                        </p>
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Note: Changing PR information will refetch the latest PR data from GitHub.
                        </small>
                      </div>
                    ) : (
                      <div className="alert alert-light" role="alert">
                        <small>
                          <i className="fas fa-info-circle me-2"></i>
                          You can link this note to a GitHub Pull Request by providing PR details below.
                        </small>
                      </div>
                    )}

                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-floating mb-3">
                          <input
                            type="number"
                            className="form-control"
                            id="github_pr_number"
                            name="github_pr_number"
                            placeholder="PR Number"
                            value={formData.github_pr_number}
                            onChange={handleChange}
                            min="1"
                          />
                          <label htmlFor="github_pr_number">
                            <i className="fas fa-hashtag me-2"></i>PR Number
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="repo_owner"
                            name="repo_owner"
                            placeholder="Repository Owner"
                            value={formData.repo_owner}
                            onChange={handleChange}
                          />
                          <label htmlFor="repo_owner">
                            <i className="fas fa-user me-2"></i>Repository Owner
                          </label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            className="form-control"
                            id="repo_name"
                            name="repo_name"
                            placeholder="Repository Name"
                            value={formData.repo_name}
                            onChange={handleChange}
                          />
                          <label htmlFor="repo_name">
                            <i className="fas fa-code-branch me-2"></i>Repository Name
                          </label>
                        </div>
                      </div>
                    </div>

                    {formData.repo_owner && formData.repo_name && (
                      <div className="alert alert-light" role="alert">
                        <small>
                          <i className="fab fa-github me-2"></i>
                          Repository: <strong>{formData.repo_owner}/{formData.repo_name}</strong>
                          {formData.github_pr_number && (
                            <>
                              {' '}- PR: <strong>#{formData.github_pr_number}</strong>
                            </>
                          )}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="d-flex justify-content-between">
                    <Link to={`/notes/${note.id}`} className="btn btn-outline-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Note
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditNote;
