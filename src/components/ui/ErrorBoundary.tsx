import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Auto reload if chunk fails to load (often due to new deployment)
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk') || error.message.includes('Failed to fetch dynamically imported module')) {
      const reloaded = sessionStorage.getItem('chunk_reloaded');
      if (!reloaded) {
        sessionStorage.setItem('chunk_reloaded', 'true');
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Halaman Gagal Dimuat</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Sistem gagal memuat halaman ini. Hal ini biasanya terjadi karena ada pembaruan sistem terbaru atau kendala jaringan saat memuat data besar.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem('chunk_reloaded');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-blue-600/20"
          >
            <RefreshCw size={18} />
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
