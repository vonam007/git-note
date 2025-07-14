import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { noteService } from '../services/noteService';
import NoteCard from '../components/NoteCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total: 0,
    per_page: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    pr_number: '',
    pr_state: '',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (searchFilters = filters) => {
    setLoading(true);
    try {
      const response = await noteService.getNotes(searchFilters);
      setNotes(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      toast.error('Failed to fetch notes');
      console.error('Fetch notes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const searchFilters = { ...filters, page: 1 };
    setFilters(searchFilters);
    fetchNotes(searchFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      pr_number: '',
      pr_state: '',
      page: 1,
      limit: 10
    };
    setFilters(resetFilters);
    fetchNotes(resetFilters);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchNotes(newFilters);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await noteService.deleteNote(noteId);
      toast.success('Note deleted successfully');
      fetchNotes(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete note');
      console.error('Delete note error:', error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="container">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-md-6">
            <h1 className="h2 mb-2">
              <i className="fas fa-sticky-note me-2 text-primary"></i>
              My Notes
            </h1>
            <p className="text-muted">
              Manage and organize your notes with GitHub PR integration
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <Link to="/notes/create" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Create New Note
            </Link>
          </div>
        </div>

        {/* Search Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* Results Summary */}
        {!loading && (
          <div className="row mb-3">
            <div className="col">
              <div className="d-flex justify-content-between align-items-center">
                <p className="text-muted mb-0">
                  Showing {notes.length} of {pagination.total} notes
                  {filters.search && ` for "${filters.search}"`}
                </p>
                {notes.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">Sort by:</small>
                    <select 
                      className="form-select form-select-sm" 
                      style={{ width: 'auto' }}
                      onChange={(e) => {
                        const newFilters = { ...filters, sort: e.target.value, page: 1 };
                        setFilters(newFilters);
                        fetchNotes(newFilters);
                      }}
                    >
                      <option value="created_at_desc">Newest First</option>
                      <option value="created_at_asc">Oldest First</option>
                      <option value="title_asc">Title A-Z</option>
                      <option value="title_desc">Title Z-A</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSpinner text="Loading notes..." />}

        {/* Notes Grid */}
        {!loading && (
          <>
            {notes.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-sticky-note"></i>
                <h4>No notes found</h4>
                <p>
                  {filters.search || filters.pr_number || filters.pr_state
                    ? 'Try adjusting your search filters or create a new note.'
                    : 'Create your first note to get started!'}
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <Link to="/notes/create" className="btn btn-primary">
                    <i className="fas fa-plus me-2"></i>
                    Create Note
                  </Link>
                  {(filters.search || filters.pr_number || filters.pr_state) && (
                    <button className="btn btn-outline-secondary" onClick={handleReset}>
                      <i className="fas fa-times me-2"></i>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="row">
                {notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
