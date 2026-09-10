import { Link } from 'react-router-dom';
import { Ghost, Settings, Sun, Moon } from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { providerType, providerService, modelId } = useProvider();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between bg-zinc-100 dark:bg-[#0a0a0a]">
      <Link to="/dashboard" className="flex items-center gap-2.5 group">
        <div className="p-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100">
          <Ghost className="w-3.5 h-3.5 text-white dark:text-zinc-900" />
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Silent Churn
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {providerType && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
            <div className={`w-1.5 h-1.5 rounded-full ${
              providerType === 'local'  ? 'bg-emerald-500' :
              providerType === 'skip'   ? 'bg-zinc-400'   : 'bg-indigo-500'
            } ${providerType !== 'skip' && 'animate-pulse'}`} />
            <span className="capitalize">{providerType === 'skip' ? 'Offline' : providerService}</span>
            {modelId && modelId !== 'default' && (
              <span className="text-zinc-400 dark:text-zinc-600 truncate max-w-[80px] pl-1">· {modelId}</span>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link
          to="/settings"
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
