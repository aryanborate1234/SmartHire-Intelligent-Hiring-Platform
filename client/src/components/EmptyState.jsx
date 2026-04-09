import { Briefcase } from 'lucide-react';

const EmptyState = ({ icon: Icon = Briefcase, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary-600/10 rounded-full blur-2xl scale-150" />
        <div className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <Icon className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{message}</p>
      {action && action}
    </div>
  );
};

export default EmptyState;
