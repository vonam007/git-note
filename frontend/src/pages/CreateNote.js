import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { noteService } from '../services/noteService';
import { useAuth } from '../contexts/AuthContext';

const CreateNote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    github_pr_number: '',
    repo_owner: '',
    repo_name: ''
  });

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

    // Validate GitHub PR fields if any are provided
    if (formData.github_pr_number || formData.repo_owner || formData.repo_name) {
      if (!user?.github_username || !user?.has_github_token) {
        toast.error('Please configure your GitHub profile to use PR integration');
        return;
      }

      if (!formData.github_pr_number || !formData.repo_owner || !formData.repo_name) {
        toast.error('All GitHub PR fields (PR number, repository owner, and repository name) are required when using PR integration');
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim()
      };

      // Add GitHub PR data if provided
      if (formData.github_pr_number) {
        noteData.github_pr_number = parseInt(formData.github_pr_number);
        noteData.repo_owner = formData.repo_owner.trim();
        noteData.repo_name = formData.repo_name.trim();
      }

      const response = await noteService.createNote(noteData);
      toast.success('Note created successfully!');
      navigate(`/notes/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create note');
      console.error('Create note error:', error);
    } finally {
      setLoading(false);
    }
  };

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
                  Create New Note
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h2 mb-0">
                <i className="fas fa-plus me-2 text-primary"></i>
                Create New Note
              </h1>
              <Link to="/notes" className="btn btn-outline-secondary">
                <i className="fas fa-times me-2"></i>
                Cancel
              </Link>
            </div>

            {/* GitHub Profile Warning */}
            {(!user?.github_username || !user?.has_github_token) && (
              <div className="alert alert-warning mb-4" role="alert">
                <h5 className="alert-heading">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  GitHub Integration Not Configured
                </h5>
                <p className="mb-2">
                  To use GitHub PR integration features, you need to configure your GitHub profile first.
                </p>
                <Link to="/profile" className="btn btn-sm btn-warning">
                  <i className="fas fa-cog me-2"></i>
                  Configure GitHub Profile
                </Link>
              </div>
            )}

            {/* Create Note Form */}
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
                      GitHub PR Integration (Optional)
                    </h5>
                    
                    <div className="alert alert-info" role="alert">
                      <small>
                        <i className="fas fa-info-circle me-2"></i>
                        Link this note to a GitHub Pull Request. When you provide PR details, 
                        we'll automatically fetch and store PR information for future reference.
                      </small>
                    </div>

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
                            disabled={!user?.github_username || !user?.has_github_token}
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
                            disabled={!user?.github_username || !user?.has_github_token}
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
                            disabled={!user?.github_username || !user?.has_github_token}
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
                    <Link to="/notes" className="btn btn-outline-secondary">
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Notes
                    </Link>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Note...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Create Note
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

export default CreateNote;
