import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EDEDE4] flex items-center justify-center p-4 font-sans text-foreground">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl border border-border/40 text-center space-y-6 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-black text-[#1E3623]">
                Something Went Wrong
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                We encountered an unexpected issue while displaying this page. Please try reloading or returning home.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] font-mono text-amber-900 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3.5 px-4 rounded-full bg-[#541D26] hover:bg-[#6B2732] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer border border-[#C8A878]/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 py-3.5 px-4 rounded-full bg-secondary hover:bg-border text-[#211A19] text-xs font-bold flex items-center justify-center space-x-2 border border-border/80 transition-all shadow-xs cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
