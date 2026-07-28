import { createContext, useState, useContext } from 'react';
import api from '../api/client';

const ProviderContext = createContext(null);

export const ProviderProvider = ({ children }) => {
  const [providerType, setProviderType] = useState(null);
  const [providerService, setProviderService] = useState(null);
  const [modelId, setModelId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectLocal = async (selectedModelId) => {
    try {
      const response = await api.connectProvider({ provider: 'lmstudio', model_id: selectedModelId });
      if (response && response.success === false) {
        throw new Error(response.message || 'Connection failed');
      }
      setProviderType('local');
      setProviderService('lmstudio');
      setModelId(selectedModelId);
      setIsConnected(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const connectCloud = async (service, apiKey, customModelId) => {
    try {
      const payload = { provider: service, api_key: apiKey };
      if (customModelId) {
        payload.model_id = customModelId;
      }
      const response = await api.connectProvider(payload);
      if (response && response.success === false) {
        throw new Error(response.message || 'Connection failed');
      }
      setProviderType('cloud');
      setProviderService(service);
      setModelId(customModelId || 'default');
      setIsConnected(true);
      return true;
    } catch (error) {
      throw error;
    }
  };

  const skipConnection = () => {
    setProviderType('skip');
    setProviderService(null);
    setModelId(null);
    setIsConnected(true);
  };

  const disconnect = async () => {
    try {
      await api.disconnectProvider();
      setProviderType(null);
      setProviderService(null);
      setModelId(null);
      setIsConnected(false);
    } catch (error) {
    }
  };

  const getConfig = () => ({
    providerType,
    providerService,
    modelId,
    isConnected
  });

  return (
    <ProviderContext.Provider value={{
      providerType,
      providerService,
      modelId,
      isConnected,
      connectLocal,
      connectCloud,
      skipConnection,
      disconnect,
      getConfig
    }}>
      {children}
    </ProviderContext.Provider>
  );
};

export const useProvider = () => useContext(ProviderContext);
