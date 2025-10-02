
import { useState, useEffect } from 'react';

export interface PendingServiceData {
  title: string;
  category: string;
  description: string;
  price: string;
  location: string;
  phone: string;
  email: string;
  experience: string;
  images: { id: string; image_name: string; image_url: string }[];
}

export const PENDING_SERVICE_KEY = 'pending_service_data';

export const usePendingService = () => {
  const [pendingService, setPendingService] = useState<PendingServiceData | null>(null);

  useEffect(() => {
    // Load pending service data from localStorage on mount
    const saved = localStorage.getItem(PENDING_SERVICE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPendingService(parsed);
      } catch (error) {
        console.error('Error parsing pending service data:', error);
        localStorage.removeItem(PENDING_SERVICE_KEY);
      }
    }
  }, []);

  const savePendingService = (serviceData: PendingServiceData) => {
    console.log('Saving pending service data:', serviceData);
    localStorage.setItem(PENDING_SERVICE_KEY, JSON.stringify(serviceData));
    setPendingService(serviceData);
  };

  const clearPendingService = () => {
    console.log('Clearing pending service data');
    localStorage.removeItem(PENDING_SERVICE_KEY);
    setPendingService(null);
  };

  const hasPendingService = () => {
    return pendingService !== null;
  };

  return {
    pendingService,
    savePendingService,
    clearPendingService,
    hasPendingService
  };
};
