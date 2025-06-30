
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceViews = () => {
  const queryClient = useQueryClient();

  const incrementView = useMutation({
    mutationFn: async (serviceId: string) => {
      // First, get the current views count
      const { data: currentData, error: fetchError } = await supabase
        .from('services')
        .select('views')
        .eq('id', serviceId)
        .single();

      if (fetchError) throw fetchError;

      // Then increment the views count
      const newViewsCount = (currentData?.views || 0) + 1;
      
      const { data, error } = await supabase
        .from('services')
        .update({ views: newViewsCount })
        .eq('id', serviceId)
        .select('views')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-services'] });
      queryClient.invalidateQueries({ queryKey: ['public-services'] });
    }
  });

  return {
    incrementView: incrementView.mutate,
    isIncrementing: incrementView.isPending
  };
};
