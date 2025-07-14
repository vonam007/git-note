import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    github_username: '',
    github_token: ''
  });
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        github_username: user.github_username || '',
        github_token: '' // Always start empty for security
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        // Clear the token field for security
        setFormData({
          ...formData,
          github_token: ''
        });
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  return (
    <div className="content-wrapper">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">
                  <i className="fas fa-user-cog me-2"></i>
                  Profile Settings
                </h4>
              </div>
              <div className="card-body">
                {/* User Info */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Account Information</h6>
                        <p className="card-text">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="card-text">
                          <strong>Member since:</strong>{' '}
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">GitHub Integration</h6>
                        <p className="card-text">
                          <strong>Status:</strong>{' '}
                          {user.has_github_token ? (
                            <span className="badge bg-success">Connected</span>
                          ) : (
                            <span className="badge bg-warning">Not Connected</span>
                          )}
                        </p>
                        {user.github_username && (
                          <p className="card-text">
                            <strong>Username:</strong> {user.github_username}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* GitHub Configuration Form */}
                <form onSubmit={handleSubmit}>
                  <h5 className="mb-3">
                    <i className="fab fa-github me-2"></i>
                    GitHub Configuration
                  </h5>
                  
                  <div className="alert alert-info" role="alert">
                    <h6 className="alert-heading">
                      <i className="fas fa-info-circle me-2"></i>
                      About GitHub Integration
                    </h6>
                    <p className="mb-2">
                      Configure your GitHub credentials to enable automatic PR information 
                      fetching when creating notes with GitHub PR numbers.
                    </p>
                    <ul className="mb-0">
                      <li>Your GitHub token is encrypted and stored securely</li>
                      <li>Token is only used to fetch public PR information</li>
                      <li>You can generate a token at: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings</a></li>
                    </ul>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="github_username"
                          name="github_username"
                          placeholder="GitHub Username"
                          value={formData.github_username}
                          onChange={handleChange}
                        />
                        <label htmlFor="github_username">
                          <i className="fab fa-github me-2"></i>GitHub Username
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating mb-3">
                        <div className="input-group">
                          <input
                            type={showToken ? 'text' : 'password'}
                            className="form-control"
                            id="github_token"
                            name="github_token"
                            placeholder={user.has_github_token ? "••••••••••••••••" : "GitHub Token"}
                            value={formData.github_token}
                            onChange={handleChange}
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                          >
                            <i className={`fas ${showToken ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                        <label htmlFor="github_token" className="ms-0">
                          <i className="fas fa-key me-2"></i>GitHub Token
                        </label>
                        {user.has_github_token && (
                          <div className="form-text text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Token is configured. Leave empty to keep current token.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Token Permissions Info */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-shield-alt me-2"></i>
                        Required Token Permissions
                      </h6>
                      <p className="card-text small">
                        When creating a GitHub Personal Access Token, you need the following permissions:
                      </p>
                      <ul className="small mb-0">
                        <li><code>public_repo</code> - Access to public repositories</li>
                        <li><code>read:user</code> - Read user profile information</li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setFormData({
                          github_username: user.github_username || '',
                          github_token: user.github_token || ''
                        });
                      }}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Reset
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Profile
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

export default Profile;
