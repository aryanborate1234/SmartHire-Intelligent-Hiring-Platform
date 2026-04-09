const StatusBadge = ({ status }) => {
  const variants = {
    'Applied': 'badge-applied',
    'Under Review': 'badge-review',
    'Shortlisted': 'badge-shortlisted',
    'Rejected': 'badge-rejected',
  };

  const dots = {
    'Applied': 'bg-blue-400',
    'Under Review': 'bg-amber-400',
    'Shortlisted': 'bg-green-400',
    'Rejected': 'bg-red-400',
  };

  return (
    <span className={variants[status] || 'badge-applied'}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-blue-400'} mr-1.5`} />
      {status}
    </span>
  );
};

export default StatusBadge;
