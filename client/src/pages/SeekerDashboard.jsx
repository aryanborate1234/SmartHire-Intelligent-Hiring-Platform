import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  User, MapPin, Briefcase, FileText, Upload, X, Plus,
  Star, ChevronRight, CheckCircle, Clock, TrendingUp
} from 'lucide-react';
import JobCard from '../components/JobCard';
import StatusBadge from '../components/StatusBadge';
import MatchBadge from '../components/MatchBadge';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const SkillInput = ({ skills, onChange }) => {
  const [input, setInput] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    const skill = input.trim();
    if (skill && !skills.includes(skill)) {
      onChange([...skills, skill]);
    }
    setInput('');
  };

  const removeSkill = (skill) => {
    onChange(skills.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addSkill(e); }}
          placeholder="Add a skill (press Enter)"
          className="input flex-1"
          id="skill-input"
        />
        <button type="button" onClick={addSkill} className="btn-secondary px-4 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill) => (
            <span key={skill} className="tag-primary flex items-center gap-1.5">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-red-400 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SeekerDashboard = () => {
  const { user } = useAuth();
  const fileRef = useRef();

  const [profile, setProfile] = useState({ skills: [], experience: '', location: '', bio: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(true);

  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(true);

  const [resumeFile, setResumeFile] = useState(null);

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Load profile
    api.get('/profile/seeker')
      .then((res) => setProfile(res.data.data))
      .catch(() => {})
      .finally(() => setProfileLoading(false));

    // Load recommended jobs
    api.get('/jobs/recommended')
      .then((res) => setRecommended(res.data.data || []))
      .catch(() => {})
      .finally(() => setRecLoading(false));

    // Load applications
    api.get('/applications')
      .then((res) => setApplications(res.data.data || []))
      .catch(() => {})
      .finally(() => setAppLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const formData = new FormData();
      formData.append('skills', JSON.stringify(profile.skills));
      formData.append('experience', profile.experience || '');
      formData.append('location', profile.location || '');
      formData.append('bio', profile.bio || '');
      if (resumeFile) formData.append('resume', resumeFile);

      const res = await api.put('/profile/seeker', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data.data);
      setResumeFile(null);
      toast.success('Profile updated successfully!');

      // Refresh recommendations
      api.get('/jobs/recommended')
        .then((r) => setRecommended(r.data.data || []))
        .catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const stats = [
    { label: 'Applications', value: applications.length, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-600/10' },
    { label: 'Shortlisted', value: applications.filter((a) => a.status === 'Shortlisted').length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-600/10' },
    { label: 'Matches', value: recommended.length, icon: Star, color: 'text-amber-400', bg: 'bg-amber-600/10' },
    { label: 'Skills', value: profile.skills?.length || 0, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-600/10' },
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'recommended', label: `Matches (${recommended.length})`, icon: Star },
    { id: 'applications', label: `Applications (${applications.length})`, icon: FileText },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-600/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${bg} rounded-xl p-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === id
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card animate-fade-in">
          {profileLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-400" />
                Edit Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location */}
                <div>
                  <label htmlFor="seeker-location" className="label">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="seeker-location"
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="input pl-10"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="seeker-experience" className="label">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="seeker-experience"
                      type="text"
                      value={profile.experience || ''}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      className="input pl-10"
                      placeholder="e.g. 3 years"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="seeker-bio" className="label">Bio</label>
                <textarea
                  id="seeker-bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="input resize-none"
                  rows={4}
                  placeholder="Tell recruiters about yourself..."
                />
              </div>

              {/* Skills */}
              <div>
                <label className="label">Skills</label>
                <SkillInput
                  skills={profile.skills || []}
                  onChange={(skills) => setProfile({ ...profile, skills })}
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="label">Resume (PDF only, max 5MB)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-primary-500 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  <Upload className="w-8 h-8 text-gray-600 group-hover:text-primary-400 mx-auto mb-2 transition-colors" />
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-primary-400">
                      <FileText className="w-4 h-4" />
                      {resumeFile.name}
                    </div>
                  ) : profile.resumeUrl ? (
                    <div>
                      <p className="text-sm text-teal-400 mb-1">Current: {profile.resumeOriginalName || 'Resume uploaded'}</p>
                      <p className="text-xs text-gray-600">Click to replace</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400">Click to upload resume</p>
                      <p className="text-xs text-gray-600 mt-1">PDF format only</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    id="resume-upload"
                    onChange={(e) => setResumeFile(e.target.files[0] || null)}
                  />
                </div>
              </div>

              <button
                type="submit"
                id="save-profile"
                disabled={profileSaving}
                className="btn-primary flex items-center gap-2 px-8"
              >
                {profileSaving ? <Spinner size="sm" /> : 'Save Profile'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Recommended Tab */}
      {activeTab === 'recommended' && (
        <div className="animate-fade-in">
          {recLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : recommended.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No matching jobs yet"
              message="Add skills to your profile to get AI-powered job recommendations."
              action={
                <button onClick={() => setActiveTab('profile')} className="btn-primary">
                  Update Profile
                </button>
              }
            />
          ) : (
            <>
              <p className="text-gray-400 mb-6">
                Found <strong className="text-white">{recommended.length}</strong> jobs matching your skills
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommended.map((job) => (
                  <JobCard key={job._id} job={job} matchScore={job.matchScore} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="animate-fade-in">
          {appLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : applications.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              message="Start applying to jobs to track your application status here."
            />
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Company</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Applied</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white text-sm">{app.jobId?.title || 'Unknown Job'}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{app.jobId?.company}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 hidden sm:table-cell">
                          {app.jobId?.company}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
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

export default SeekerDashboard;
