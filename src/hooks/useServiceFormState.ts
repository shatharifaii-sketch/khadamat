import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingService } from '@/hooks/usePendingService';
import { Service, ServiceFormData } from '@/types/service';

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
  });

  // Load service data for editing or pending service data
  useEffect(() => {
    if (serviceToEdit) {
      console.log('Loading service data for editing');
      setFormData({
        title: serviceToEdit.title,
        category: serviceToEdit.category,
        description: serviceToEdit.description,
        price: serviceToEdit.price_range,
        location: serviceToEdit.location,
        phone: serviceToEdit.phone,
        email: serviceToEdit.email,
        experience: serviceToEdit.experience || '',
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
  }, [user?.email, isEditMode]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    isEditMode
  };
};