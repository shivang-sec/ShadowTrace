import { useState, useEffect, useCallback } from 'react';
import { HealthStatus } from '../types/api';
import { apiService } from '../services/api';

export function useHealth(pollIntervalMs = 12000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getHealth();
      setHealth(res);
      setError(null);
    } catch (err) {
      setHealth(null);
      setError(err instanceof Error ? err.message : 'Backend offline');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, pollIntervalMs);
    return () => clearInterval(timer);
  }, [check, pollIntervalMs]);

  return { health, isLoading, error, refresh: check };
}
