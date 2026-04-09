import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, Briefcase } from 'lucide-react';
import MatchBadge from './MatchBadge';

const typeColors = {
  'Full-time': 'bg-primary-600/10 text-primary-400 border-primary-600/30',
  'Part-time': 'bg-purple-600/10 text-purple-400 border-purple-600/30',
  'Remote': 'bg-teal-600/10 text-teal-400 border-teal-600/30',
  'Contract': 'bg-orange-600/10 text-orange-400 border-orange-600/30',
  'Internship': 'bg-pink-600/10 text-pink-400 border-pink-600/30',
};

const JobCard = ({
  job,
  matchScore,
  isBookmarked,
  onToggleBookmark,
  showBookmark = false,
}) => {
  const salary =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k–$${(job.salaryMax / 1000).toFixed(0)}k`
      : job.salaryMin
      ? `From $${(job.salaryMin / 1000).toFixed(0)}k`
      : 'Salary not specified';

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <div className="card-hover group relative flex flex-col gap-4">
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/0 to-teal-600/0 group-hover:from-primary-600/5 group-hover:to-teal-600/5 rounded-2xl transition-all duration-300 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <Link
              to={`/jobs/${job._id}`}
              className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <p className="text-sm text-gray-400 mt-0.5">{job.company}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {matchScore !== undefined && <MatchBadge score={matchScore} />}
          {showBookmark && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark && onToggleBookmark(job._id);
              }}
              className="p-2 rounded-xl text-gray-500 hover:text-primary-400 hover:bg-primary-600/10 transition-all duration-200"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-primary-400" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-sm text-gray-500 relative">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
          {salary}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* Type badge + Skills */}
      <div className="flex flex-wrap gap-2 relative">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            typeColors[job.type] || typeColors['Full-time']
          }`}
        >
          {job.type}
        </span>
        {job.requiredSkills?.slice(0, 4).map((skill) => (
          <span key={skill} className="tag text-xs">
            {skill}
          </span>
        ))}
        {job.requiredSkills?.length > 4 && (
          <span className="tag text-xs">+{job.requiredSkills.length - 4}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800 relative">
        <span className="text-xs text-gray-600">
          Posted by {job.recruiterId?.name || 'Recruiter'}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
