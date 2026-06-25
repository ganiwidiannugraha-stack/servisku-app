import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-gray-200 border-dashed rounded-xl">
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 mb-4 text-gray-400 bg-gray-50 rounded-full">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-6 text-sm text-gray-500 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
