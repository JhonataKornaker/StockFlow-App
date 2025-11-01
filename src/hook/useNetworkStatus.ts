import { NetworkService } from '@/service/network.service';
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar status inicial
    NetworkService.isOnline().then(status => {
      setIsOnline(status);
      setIsChecking(false);
    });

    // Observar mudanças
    const unsubscribe = NetworkService.subscribe(setIsOnline);

    return () => unsubscribe();
  }, []);

  return { isOnline, isChecking };
};
