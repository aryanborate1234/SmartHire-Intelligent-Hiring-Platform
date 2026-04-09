import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    api.get('/applications')
      .then((res) => setApplications(res.data.data || []))
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const statusCounts = {
    Applied: applications.filter((a) => a.status === 'Applied').length,
    'Under Review': applications.filter((a) => a.status === 'Under Review').length,
    Shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    Rejected: applications.filter((a) => a.status === 'Rejected').length,
  };

  const stats = [
    { label: 'Total Applied', value: applications.length, color: 'text-white', bg: 'bg-gray-800' },
    { label: 'Under Review', value: statusCounts['Under Review'], color: 'text-amber-400', bg: 'bg-amber-600/10' },
    { label: 'Shortlisted', value: statusCounts['Shortlisted'], color: 'text-green-400', bg: 'bg-green-600/10' },
    { label: 'Rejected', value: statusCounts['Rejected'], color: 'text-red-400', bg: 'bg-red-600/10' },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Applications</h1>
          <p className="text-gray-400">Track your job application progress</p>
        </div>
        <button
          onClick={() => fetchApplications(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm"
          aria-label="Refresh applications"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, color, bg }) => (
            <div key={label} className={`card ${bg} border-gray-800`}>
              <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pipeline progress */}
      {applications.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Application Pipeline</h2>
          <div className="flex items-center gap-2">
            {[
              { label: 'Applied', color: 'bg-blue-500', count: statusCounts['Applied'] },
              { label: 'Review', color: 'bg-amber-500', count: statusCounts['Under Review'] },
              { label: 'Shortlisted', color: 'bg-green-500', count: statusCounts['Shortlisted'] },
              { label: 'Rejected', color: 'bg-red-500', count: statusCounts['Rejected'] },
            ].map(({ label, color, count }, idx, arr) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: applications.length ? `${(count / applications.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          message="Browse available jobs and start applying. Your applications will be tracked here."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Applied Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">
                        {app.jobId?.title || 'Job no longer available'}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5 sm:hidden">{app.jobId?.company}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">
                      {app.jobId?.company || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      {app.jobId?.location || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(app.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {app.jobId?._id && (
                        <Link
                          to={`/jobs/${app.jobId._id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-400 transition-colors"
                        >
                          View Job
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
