import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  Plus, Briefcase, Edit2, Trash2, Users, X, ChevronDown,
  MapPin, DollarSign, Clock, FileText, Building2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'];
const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Rejected'];

const SkillTagInput = ({ skills, onChange }) => {
  const [input, setInput] = useState('');
  const add = (e) => {
    e.preventDefault();
    const s = input.trim();
    if (s && !skills.includes(s)) onChange([...skills, s]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(e); }}
          placeholder="Type skill and press Enter"
          className="input flex-1 text-sm"
        />
        <button type="button" onClick={add} className="btn-secondary px-3 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <span key={s} className="tag-primary flex items-center gap-1">
              {s}
              <button type="button" onClick={() => onChange(skills.filter((x) => x !== s))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const emptyJobForm = {
  title: '', company: '', location: '', salaryMin: '', salaryMax: '',
  type: 'Full-time', requiredSkills: [], description: '',
};

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyJobForm);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Applicants view
  const [applicantsJobId, setApplicantsJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = () => {
    setJobsLoading(true);
    api.get('/jobs/my-jobs')
      .then((res) => setJobs(res.data.data || []))
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Job title is required';
    if (!form.company.trim()) errs.company = 'Company is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : 0,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : 0,
      };
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, payload);
        toast.success('Job updated successfully!');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job posted successfully!');
      }
      setShowForm(false);
      setEditingJob(null);
      setForm(emptyJobForm);
      fetchMyJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salaryMin: job.salaryMin || '',
      salaryMax: job.salaryMax || '',
      type: job.type,
      requiredSkills: job.requiredSkills || [],
      description: job.description,
    });
    setShowForm(true);
    setActiveTab('jobs');
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted');
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const viewApplicants = async (jobId) => {
    setApplicantsJobId(jobId);
    setActiveTab('applicants');
    setApplicantsLoading(true);
    try {
      const res = await api.get(`/jobs/${jobId}/applicants`);
      setApplicants(res.data.data || []);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateApplicantStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      setApplicants(applicants.map((a) => (a._id === appId ? { ...a, status } : a)));
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm capitalize">Recruiter Dashboard</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingJob(null); setForm(emptyJobForm); setActiveTab('jobs'); }}
          className="btn-primary flex items-center gap-2"
          id="post-job-btn"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="bg-primary-600/10 rounded-xl p-3">
            <Briefcase className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{jobs.length}</div>
            <div className="text-sm text-gray-500">Active Jobs</div>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="bg-teal-600/10 rounded-xl p-3">
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">–</div>
            <div className="text-sm text-gray-500">Total Applicants</div>
          </div>
        </div>
        <div className="card flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="bg-green-600/10 rounded-xl p-3">
            <Building2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white capitalize">{user?.role}</div>
            <div className="text-sm text-gray-500">Account Type</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'jobs' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Jobs ({jobs.length})
        </button>
        {applicantsJobId && (
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'applicants' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Applicants ({applicants.length})
          </button>
        )}
      </div>

      {/* Post/Edit Job Form */}
      {showForm && (
        <div className="card mb-8 animate-slide-up border-primary-600/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {editingJob ? 'Edit Job Posting' : 'Post a New Job'}
            </h2>
            <button
              onClick={() => { setShowForm(false); setEditingJob(null); setForm(emptyJobForm); }}
              className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitJob} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="job-title" className="label">Job Title *</label>
                <input
                  id="job-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`input ${formErrors.title ? 'border-red-500' : ''}`}
                  placeholder="e.g. Senior React Developer"
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label htmlFor="job-company" className="label">Company Name *</label>
                <input
                  id="job-company"
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className={`input ${formErrors.company ? 'border-red-500' : ''}`}
                  placeholder="Your company name"
                />
                {formErrors.company && <p className="text-red-400 text-xs mt-1">{formErrors.company}</p>}
              </div>

              <div>
                <label htmlFor="job-location" className="label">Location *</label>
                <input
                  id="job-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className={`input ${formErrors.location ? 'border-red-500' : ''}`}
                  placeholder="e.g. New York, NY"
                />
                {formErrors.location && <p className="text-red-400 text-xs mt-1">{formErrors.location}</p>}
              </div>

              <div>
                <label htmlFor="job-type" className="label">Job Type</label>
                <select
                  id="job-type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input"
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-gray-800">{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="job-salary-min" className="label">Min Salary ($/yr)</label>
                <input
                  id="job-salary-min"
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                  className="input"
                  placeholder="e.g. 80000"
                />
              </div>

              <div>
                <label htmlFor="job-salary-max" className="label">Max Salary ($/yr)</label>
                <input
                  id="job-salary-max"
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                  className="input"
                  placeholder="e.g. 120000"
                />
              </div>
            </div>

            <div>
              <label className="label">Required Skills</label>
              <SkillTagInput
                skills={form.requiredSkills}
                onChange={(skills) => setForm({ ...form, requiredSkills: skills })}
              />
            </div>

            <div>
              <label htmlFor="job-description" className="label">Job Description *</label>
              <textarea
                id="job-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`input resize-none ${formErrors.description ? 'border-red-500' : ''}`}
                rows={6}
                placeholder="Describe the role, responsibilities, and requirements..."
              />
              {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 px-8" id="submit-job">
                {submitting ? <Spinner size="sm" /> : (editingJob ? 'Update Job' : 'Post Job')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingJob(null); setForm(emptyJobForm); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {activeTab === 'jobs' && (
        <div className="animate-fade-in">
          {jobsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No job postings yet"
              message="Post your first job to start attracting top talent."
              action={
                <button onClick={() => setShowForm(true)} className="btn-primary">
                  Post First Job
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="card hover:border-gray-700 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{job.type}</span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salaryMin && `$${(job.salaryMin/1000).toFixed(0)}k`}
                            {job.salaryMin && job.salaryMax && ' – '}
                            {job.salaryMax && `$${(job.salaryMax/1000).toFixed(0)}k`}
                          </span>
                        )}
                      </div>
                      {job.requiredSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.requiredSkills.slice(0, 5).map((s) => (
                            <span key={s} className="tag text-xs">{s}</span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="tag text-xs">+{job.requiredSkills.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => viewApplicants(job._id)}
                        className="btn-secondary flex items-center gap-2 text-sm py-2 px-3"
                      >
                        <Users className="w-4 h-4" />
                        Applicants
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 rounded-xl text-gray-400 hover:text-primary-400 hover:bg-primary-600/10 transition-colors"
                        aria-label="Edit job"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-600/10 transition-colors"
                        aria-label="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applicants Tab */}
      {activeTab === 'applicants' && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Applicants — {jobs.find((j) => j._id === applicantsJobId)?.title}
            </h2>
            <button
              onClick={() => { setActiveTab('jobs'); setApplicantsJobId(null); }}
              className="btn-ghost text-sm"
            >
              ← Back to Jobs
            </button>
          </div>

          {applicantsLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : applicants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No applicants yet"
              message="Your job posting is live. Applicants will appear here."
            />
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Applied</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {applicants.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                              {app.seekerId?.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-white text-sm">{app.seekerId?.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">{app.seekerId?.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicantStatus(app._id, e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-primary-500"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="bg-gray-800">{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
