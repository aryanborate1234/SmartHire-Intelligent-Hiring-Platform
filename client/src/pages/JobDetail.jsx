import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, DollarSign, Clock, Bookmark, BookmarkCheck,
  ArrowLeft, Briefcase, CheckCircle, Building2, Send, AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';
import JobCard from '../components/JobCard';

const typeColors = {
  'Full-time': 'bg-primary-600/10 text-primary-400 border-primary-600/30',
  'Part-time': 'bg-purple-600/10 text-purple-400 border-purple-600/30',
  'Remote': 'bg-teal-600/10 text-teal-400 border-teal-600/30',
  'Contract': 'bg-orange-600/10 text-orange-400 border-orange-600/30',
  'Internship': 'bg-pink-600/10 text-pink-400 border-pink-600/30',
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/jobs/${id}`)
      .then((res) => {
        setJob(res.data.data);
        setSimilarJobs(res.data.similarJobs || []);
      })
      .catch(() => toast.error('Job not found'))
      .finally(() => setLoading(false));

    if (user?.role === 'seeker') {
      api.get(`/applications/check/${id}`)
        .then((res) => setApplied(res.data.applied))
        .catch(() => {});

      api.get('/bookmarks')
        .then((res) => {
          const ids = (res.data.data || []).map((b) => b.jobId?._id);
          setIsBookmarked(ids.includes(id));
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }
    if (user.role !== 'seeker') {
      toast.error('Only job seekers can apply');
      return;
    }
    setApplying(true);
    try {
      await api.post('/applications', { jobId: id });
      setApplied(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Please login to bookmark jobs');
      return;
    }
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await api.post(`/bookmarks/${id}`);
        setIsBookmarked(true);
        toast.success('Job bookmarked!');
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Job not found.{' '}
        <Link to="/jobs" className="text-primary-400 ml-2">Browse jobs →</Link>
      </div>
    );
  }

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k / yr`
      : 'Salary negotiable';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Back */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header Card */}
          <div className="card">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">{job.title}</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-gray-500" />
                {salary}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${typeColors[job.type] || typeColors['Full-time']}`}>
                {job.type}
              </span>
            </div>
          </div>

          {/* Skills */}
          {job.requiredSkills?.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span key={skill} className="tag-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Job Description</h2>
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
              {job.description}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Apply Card */}
          <div className="card sticky top-20">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-white mb-1">{salary}</div>
              <div className="text-sm text-gray-500">{job.type} position</div>
            </div>

            {applied ? (
              <div className="flex items-center justify-center gap-2 bg-green-600/10 border border-green-600/30 rounded-xl p-4 text-green-400 font-semibold">
                <CheckCircle className="w-5 h-5" />
                Application Submitted
              </div>
            ) : user?.role === 'recruiter' ? (
              <div className="flex items-center justify-center gap-2 bg-gray-800 rounded-xl p-4 text-gray-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                Recruiters cannot apply
              </div>
            ) : (
              <button
                id="apply-btn"
                onClick={handleApply}
                disabled={applying}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
              >
                {applying ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {user ? 'Apply Now' : 'Login to Apply'}
                  </>
                )}
              </button>
            )}

            {user && (
              <button
                onClick={handleBookmark}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium transition-all text-sm ${
                  isBookmarked
                    ? 'bg-primary-600/10 border-primary-600/30 text-primary-400'
                    : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white bg-gray-800'
                }`}
              >
                {isBookmarked ? (
                  <><BookmarkCheck className="w-4 h-4" /> Bookmarked</>
                ) : (
                  <><Bookmark className="w-4 h-4" /> Save Job</>
                )}
              </button>
            )}

            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
              <div>
                <div className="text-xs text-gray-600 mb-1">Posted by</div>
                <div className="text-sm font-medium text-gray-300">{job.recruiterId?.name || 'Recruiter'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Location</div>
                <div className="text-sm font-medium text-gray-300">{job.location}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Jobs */}
      {similarJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">Similar Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarJobs.map((j) => (
              <JobCard key={j._id} job={j} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
