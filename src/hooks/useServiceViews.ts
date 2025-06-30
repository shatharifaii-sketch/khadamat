
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useServiceViews = () => {
  const queryClient = useQueryClient();

  const incrementView = useMutation({
    mutationFn: async (serviceId: string) => {
      const { data, error } = await supabase
        .from('services')
        .update({ views: supabase.sql`views + 1` })
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
