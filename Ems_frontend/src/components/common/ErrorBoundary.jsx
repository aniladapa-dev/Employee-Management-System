import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container mt-5">
                    <div className="card shadow-sm border-0 p-5 text-center">
                        <div className="mb-4 text-danger">
                            <i className="fas fa-exclamation-triangle fa-4x"></i>
                        </div>
                        <h2 className="fw-bold">Something went wrong</h2>
                        <p className="text-muted">The application encountered an unexpected error. Please try refreshing the page or contact support.</p>
                        <button 
                            className="btn btn-primary rounded-pill px-4 mt-3"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                        <div className="mt-4 p-3 bg-light rounded text-start small overflow-auto" style={{ maxHeight: '200px' }}>
                            <code className="text-danger">{this.state.error && this.state.error.toString()}</code>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
