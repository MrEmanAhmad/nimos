import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            {/* Restaurant-themed icon: a broken plate / warning */}
            <div className="w-24 h-24 rounded-full bg-[#1a1a2e] border border-[#e94560]/20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#e94560]/5">
              <svg className="w-12 h-12 text-[#e94560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-[#e0e0e0]/60 mb-2 text-lg">
              Our kitchen hit a snag, but we're on it.
            </p>
            <p className="text-[#e0e0e0]/40 mb-8 text-sm">
              Don't worry, your cart is safe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleTryAgain}
                className="bg-[#e94560] hover:bg-[#d13350] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#e94560]/20 hover:shadow-[#e94560]/30"
              >
                Try Again
              </button>
              <a
                href="/"
                className="bg-[#1a1a2e] hover:bg-[#1a1a2e]/80 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20"
              >
                Go Home
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-[#1a1a2e] rounded-xl p-4 border border-white/5">
                <summary className="text-[#e0e0e0]/40 text-xs cursor-pointer hover:text-[#e0e0e0]/60 transition-colors">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 text-[#e94560]/70 text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
