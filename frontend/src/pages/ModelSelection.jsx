import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Cloud, Eye, EyeOff, Loader2, Ghost } from 'lucide-react';
import { useProvider } from '../context/ProviderContext';
import api from '../api/client';

export default function ModelSelection() {
  const navigate = useNavigate();
  const { connectLocal, connectCloud, skipConnection } = useProvider();

  const [activeCard, setActiveCard] = useState(null);

  const [localModels, setLocalModels] = useState([]);
  const [selectedLocalModel, setSelectedLocalModel] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [localError, setLocalError] = useState('');

  const [cloudService, setCloudService] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [cloudModelId, setCloudModelId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [cloudError, setCloudError] = useState('');

  const fetchLocalModels = useCallback(async () => {
    setIsLoadingLocal(true);
    setLocalError('');
    try {
      const models = await api.getLocalModels();
      setLocalModels(models.map(m => ({ id: m, name: m })));
      setSelectedLocalModel(models[0] || '');
    } catch {
      setLocalError('Could not connect to LM Studio. Open LM Studio, load a model, then start the Local Server.');
    } finally {
      setIsLoadingLocal(false);
    }
  }, []);

  useEffect(() => {
    if (activeCard === 'local') fetchLocalModels();
  }, [activeCard, fetchLocalModels]);

  const handleConnectLocal = async () => {
    if (!selectedLocalModel) return;
    setIsLoadingLocal(true);
    try {
      await connectLocal(selectedLocalModel);
      navigate('/dashboard');
    } catch {
      setLocalError('Failed to connect to local model.');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  const handleConnectCloud = async () => {
    if (!apiKey) { setCloudError('API Key is required.'); return; }
    setIsLoadingCloud(true);
    setCloudError('');
    try {
      await connectCloud(cloudService, apiKey, cloudModelId);
      // The key is intentionally ephemeral: do not retain it after the
      // backend has verified the connection or write it to browser storage.
      setApiKey('');
      navigate('/dashboard');
    } catch {
      setCloudError('Failed to verify API key. Please check and try again.');
    } finally {
      setIsLoadingCloud(false);
    }
  };

  const handleSkip = () => {
    skipConnection();
    navigate('/dashboard');
  };

  const placeholderByService = {
    groq:      'llama-3.1-8b-instant',
    openai:    'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20240620',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">

      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center mb-5">
          <div className="p-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 mr-3">
            <Ghost className="w-7 h-7 text-white dark:text-zinc-900" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Silent Churn</h1>
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
          Detect customer churn before it happens. Choose an AI provider to begin analysis.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-2xl animate-slide-up">

        <div
          className={`flex-1 bg-white dark:bg-[#141414] rounded-2xl p-6 cursor-pointer ${activeCard === 'local' ? 'ring-2 ring-zinc-900 dark:ring-zinc-100' : ''}`}
          onClick={() => setActiveCard(activeCard === 'local' ? null : 'local')}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Server className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Local Model</h2>
              <p className="text-xs text-zinc-500">via LM Studio</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Private</span>
          </div>

          {activeCard === 'local' && (
            <div 
              className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-4 animate-fade-in cursor-default"
              onClick={e => e.stopPropagation()}
            >
              {isLoadingLocal && localModels.length === 0 ? (
                <div className="flex items-center justify-center text-zinc-500 py-4 text-sm gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning port 1234...</span>
                </div>
              ) : localError ? (
                <div className="bg-rose-50 dark:bg-rose-950 rounded-xl p-3 text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                  {localError}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Select Model</label>
                    <select
                      className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                      value={selectedLocalModel}
                      onChange={e => setSelectedLocalModel(e.target.value)}
                      onClick={e => e.stopPropagation()}
                    >
                      {localModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleConnectLocal(); }}
                    disabled={!selectedLocalModel || isLoadingLocal}
                    className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
                  >
                    {isLoadingLocal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex-1 bg-white dark:bg-[#141414] rounded-2xl p-6 cursor-pointer ${activeCard === 'cloud' ? 'ring-2 ring-zinc-900 dark:ring-zinc-100' : ''}`}
          onClick={() => setActiveCard(activeCard === 'cloud' ? null : 'cloud')}
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
              <Cloud className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Cloud Provider</h2>
              <p className="text-xs text-zinc-500">OpenAI, Anthropic, Groq</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">Cloud</span>
          </div>

          {activeCard === 'cloud' && (
            <div 
              className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-fade-in cursor-default"
              onClick={e => e.stopPropagation()}
            >
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Service</label>
                <select
                  className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                  value={cloudService}
                  onChange={e => setCloudService(e.target.value)}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="groq">Groq</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl pl-3 pr-10 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                    placeholder="sk-..."
                    value={apiKey}
                    autoComplete="off"
                    spellCheck="false"
                    onChange={e => setApiKey(e.target.value)}
                    onClick={e => e.stopPropagation()}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    onClick={e => { e.stopPropagation(); setShowApiKey(!showApiKey); }}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {cloudError && <p className="text-rose-500 text-xs mt-1.5">{cloudError}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Model ID <span className="text-zinc-400">(optional)</span></label>
                <input
                  type="text"
                  className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
                  placeholder={placeholderByService[cloudService] || ''}
                  value={cloudModelId}
                  onChange={e => setCloudModelId(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>

              <button
                onClick={e => { e.stopPropagation(); handleConnectCloud(); }}
                disabled={!apiKey || isLoadingCloud}
                className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
              >
                {isLoadingCloud ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect & Verify'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSkip}
          className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 px-4 py-2 font-medium"
        >
          Skip without AI →
        </button>
      </div>
    </div>
  );
}
