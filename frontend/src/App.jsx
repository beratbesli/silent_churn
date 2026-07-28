import { Routes, Route, Link } from 'react-router-dom'
import ModelSelection from './pages/ModelSelection'
import Dashboard from './pages/Dashboard'
import CustomerDetail from './pages/CustomerDetail'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'
import ChatWidget from './components/ChatWidget'

function NotFound() {
 return (
 <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
 <div className="text-center">
 <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700 mb-4">404</h1>
 <p className="text-zinc-500 mb-6">Page not found</p>
 <Link to="/dashboard" className="px-6 py-2.5 rounded-3xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-50 dark:text-zinc-900 text-sm font-medium">
 Go to Dashboard
 </Link>
 </div>
 </div>
 )
}

function App() {
 return (
 <ErrorBoundary>
 <div className="w-full min-h-screen font-sans relative overflow-x-hidden">
 <Routes>
 <Route path="/" element={<ModelSelection />} />
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/customer/:id" element={<CustomerDetail />} />
 <Route path="/settings" element={<Settings />} />
 <Route path="*" element={<NotFound />} />
 </Routes>
 <ChatWidget />
 </div>
 </ErrorBoundary>
 )
}

export default App
