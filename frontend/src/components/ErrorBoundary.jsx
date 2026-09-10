import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error };
 }

 componentDidCatch(_error, _info) {
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
 <div className="bg-zinc-50 dark:bg-[#121214] rounded-2xl p-10 max-w-lg w-full text-center">
 <div className="flex justify-center mb-6">
 <div className="p-4 rounded-full bg-rose-500/20">
 <AlertTriangle className="w-10 h-10 text-rose-400" />
 </div>
 </div>
 <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
 <p className="text-slate-400 text-sm mb-6 leading-relaxed">
 An unexpected error occurred. Please try refreshing the page.
 If the problem persists, check the browser console for more details.
 </p>
 <p className="text-xs font-mono text-rose-400/80 bg-rose-500/10 rounded-2xl p-3 mb-6 text-left break-words">
 {this.state.error?.message || 'Unknown error'}
 </p>
 <button
 onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
 className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-medium "
 >
 Go back to start
 </button>
 </div>
 </div>
 );
 }
 return this.props.children;
 }
}

ErrorBoundary.propTypes = {
 children: PropTypes.node.isRequired,
};
