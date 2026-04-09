import { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X, MapPin, Briefcase } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import useDebounce from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];

const Jobs = () => {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [bookmarks, setBookmarks] = useState([]);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedLocation = useDebounce(location, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, debouncedLocation, type, salaryMin]);

  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, debouncedLocation, type, salaryMin, currentPage]);

  useEffect(() => {
    if (user) {
      api.get('/bookmarks')
        .then((res) => setBookmarks((res.data.data || []).map((b) => b.jobId?._id)))
        .catch(() => {});
    }
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (debouncedLocation) params.set('location', debouncedLocation);
      if (type) params.set('type', type);
      if (salaryMin) params.set('salaryMin', salaryMin);
      params.set('page', currentPage);
      params.set('limit', 10);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (jobId) => {
    if (!user) {
      toast.error('Please login to bookmark jobs');
      return;
    }
    const isBookmarked = bookmarks.includes(jobId);
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${jobId}`);
        setBookmarks(bookmarks.filter((id) => id !== jobId));
        toast.success('Bookmark removed');
      } else {
        await api.post(`/bookmarks/${jobId}`);
        setBookmarks([...bookmarks, jobId]);
        toast.success('Job bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setType('');
    setSalaryMin('');
    setCurrentPage(1);
  };

  const hasFilters = search || location || type || salaryMin;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
        <p className="text-gray-400">
          {pagination.total > 0
            ? `${pagination.total} opportunities available`
            : 'Find your perfect next role'}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="jobs-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12 py-3.5 text-base"
              placeholder="Search jobs, companies, or keywords..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all text-sm ${
              hasFilters
                ? 'bg-primary-600/10 border-primary-600/50 text-primary-400'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {[location, type, salaryMin].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {filtersOpen && (
          <div className="card animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location */}
              <div>
                <label htmlFor="filter-location" className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="filter-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input pl-9 text-sm"
                    placeholder="City or state..."
                  />
                </div>
              </div>

              {/* Job Type */}
              <div>
                <label htmlFor="filter-type" className="label">Job Type</label>
                <select
                  id="filter-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input text-sm"
                >
                  <option value="" className="bg-gray-800">All Types</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-gray-800">{t}</option>
                  ))}
                </select>
              </div>

              {/* Min Salary */}
              <div>
                <label htmlFor="filter-salary" className="label">Min Salary ($/yr)</label>
                <input
                  id="filter-salary"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="input text-sm"
                  placeholder="e.g. 60000"
                />
              </div>

              {/* Clear */}
              <div className="flex items-end">
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-danger w-full flex items-center justify-center gap-2">
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2">
            {location && (
              <span className="tag-primary flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {location}
                <button onClick={() => setLocation('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {type && (
              <span className="tag-primary flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {type}
                <button onClick={() => setType('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {salaryMin && (
              <span className="tag-primary flex items-center gap-1">
                Min ${(parseInt(salaryMin) / 1000).toFixed(0)}k
                <button onClick={() => setSalaryMin('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="xl" />
          <p className="text-gray-500">Searching jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No jobs found"
          message={
            hasFilters
              ? 'Try adjusting your filters or search term.'
              : 'No jobs are available right now. Check back soon!'
          }
          action={
            hasFilters && (
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isBookmarked={bookmarks.includes(job._id)}
                onToggleBookmark={handleToggleBookmark}
                showBookmark={true}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Jobs;
