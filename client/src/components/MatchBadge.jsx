const MatchBadge = ({ score }) => {
  const color =
    score >= 80
      ? 'bg-green-600/15 text-green-400 border-green-600/30'
      : score >= 60
      ? 'bg-teal-600/15 text-teal-400 border-teal-600/30'
      : 'bg-primary-600/15 text-primary-400 border-primary-600/30';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {score}% match
    </span>
  );
};

export default MatchBadge;
