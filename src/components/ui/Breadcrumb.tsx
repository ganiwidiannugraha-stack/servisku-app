import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  path?: string; // Add path for compatibility
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md pt-6 pb-4 -mt-8 -mx-8 px-8 mb-8 border-b border-gray-200/50 shadow-sm flex items-center">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center justify-center p-1.5 mr-3 rounded-lg hover:bg-gray-200 text-gray-700 transition-colors"
        title="Kembali"
      >
        <ArrowLeft size={18} />
      </button>
      <nav className="flex items-center space-x-2 text-[15px] text-gray-500">
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium">
          <Home size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        
        {items.filter(item => !(item.label === 'Dashboard' && (item.href === '/dashboard' || item.path === '/dashboard'))).map((item, index) => {
          const target = item.href || item.path;
          return (
            <React.Fragment key={index}>
              <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              {target ? (
                <Link to={target} className="hover:text-blue-600 transition-colors whitespace-nowrap font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-bold whitespace-nowrap truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};
