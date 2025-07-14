import React from 'react';

const SearchFilters = ({ filters, onFiltersChange, onSearch, onReset }) => {
  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="search-filters">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                id="search"
                placeholder="Search notes..."
                value={filters.search || ''}
                onChange={(e) => handleInputChange('search', e.target.value)}
              />
              <label htmlFor="search">
                <i className="fas fa-search me-2"></i>Search notes...
              </label>
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                id="pr_number"
                placeholder="PR Number"
                value={filters.pr_number || ''}
                onChange={(e) => handleInputChange('pr_number', e.target.value)}
              />
              <label htmlFor="pr_number">PR Number</label>
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="pr_state"
                value={filters.pr_state || ''}
                onChange={(e) => handleInputChange('pr_state', e.target.value)}
              >
                <option value="">All States</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="merged">Merged</option>
              </select>
              <label htmlFor="pr_state">PR State</label>
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="form-floating">
              <select
                className="form-select"
                id="limit"
                value={filters.limit || '10'}
                onChange={(e) => handleInputChange('limit', e.target.value)}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
              <label htmlFor="limit">Per Page</label>
            </div>
          </div>
          
          <div className="col-md-2">
            <div className="d-flex gap-2 h-100">
              <button 
                type="submit" 
                className="btn btn-primary flex-fill d-flex align-items-center justify-content-center"
              >
                <i className="fas fa-search me-2"></i>Search
              </button>
              <button 
                type="button" 
                className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                onClick={onReset}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
