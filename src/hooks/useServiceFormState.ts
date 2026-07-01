import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingService } from '@/hooks/usePendingService';
import { ServiceFormData } from '@/types/service';
import { Service } from './useAdminFunctionality';
import { ServiceLink } from '@/components/PostService/ServiceLinks';

export const useServiceFormState = (serviceToEdit?: Service | null) => {
  const { user } = useAuth();
  const { pendingService } = usePendingService();
  const isEditMode = !!serviceToEdit;
  
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    phone: '',
    email: user?.email || '',
    experience: '',
    is_online: false,
    links: [],
    whatsapp_number: {
      countryCode: '',
      number: '',
    },
    media: [
      {
        id: '',
        name: '',
        url: '',
        thumbnail_url: '',
      }
    ],
  });

  // Load service data for editing or pending service data
  useEffect(() => {
    if (serviceToEdit) {
      const digits = serviceToEdit.whatsapp_number.toString().replace(/\D/g, "");

      setFormData({
        title: serviceToEdit.title,
        category: serviceToEdit.category,
        description: serviceToEdit.description,
        price: serviceToEdit.price_range,
        location: serviceToEdit.location,
        phone: serviceToEdit.phone,
        email: serviceToEdit.email,
        experience: serviceToEdit.experience || '',
        is_online: serviceToEdit.is_online || false,
        links: serviceToEdit.links as [],
        whatsapp_number: {
          countryCode: digits.slice(0, digits.length - 9),
          number: digits.slice(digits.length - 9),
        },
        media: serviceToEdit.service_media,
      });

    } else if (pendingService && !isEditMode) {
      console.log('Loading pending service data into form');
      setFormData(pendingService);
    }
  }, [serviceToEdit, pendingService, isEditMode]);

  // Update email when user changes
  useEffect(() => {
    if (user?.email && !formData.email && !isEditMode) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [user.email, isEditMode, formData.email]);

  const handleInputChange = (
    field: string, value: string | 
    { id: string; name: string; url: string; thumbnail_url?: string, type?: string }[] | 
    boolean | 
    ServiceLink[] |
    { 
      countryCode: string;
      number: string;
    }
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    isEditMode
  };
};