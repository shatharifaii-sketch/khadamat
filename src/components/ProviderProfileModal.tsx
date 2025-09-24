import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Briefcase, Calendar } from 'lucide-react';
import { PublicService } from '@/hooks/usePublicServices';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProviderProfileModalProps {
  service: PublicService | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProviderProfileModal = ({ service, isOpen, onClose }: ProviderProfileModalProps) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['provider-profile', service?.user_id],
    queryFn: async () => {
      if (!service?.user_id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', service.user_id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!service?.user_id && isOpen,
  });

  const { data: providerServices } = useQuery({
    queryKey: ['provider-services', service?.user_id],
    queryFn: async () => {
      if (!service?.user_id) return [];
      
      const { data, error } = await supabase
        .from('services')
        .select('id, title, category, created_at')
        .eq('user_id', service.user_id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!service?.user_id && isOpen,
  });

  if (!service) return null;

  const providerName = profile?.full_name || 'مقدم الخدمة';
  const initials = providerName.split(' ').map(name => name[0]).join('').toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto arabic">
        <DialogHeader>
          <DialogTitle className="text-right text-2xl">ملف مقدم الخدمة</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 justify-end">
              <div className="text-right">
                <h2 className="text-xl font-semibold">{providerName}</h2>
                {profile?.location && (
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <span className="text-muted-foreground text-sm">{profile.location}</span>
                    <MapPin size={14} />
                  </div>
                )}
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.profile_image_url || ''} alt={providerName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>

            {profile?.bio && (
              <div className="text-right">
                <h3 className="font-semibold mb-2 flex items-center gap-2 justify-end">
                  <User size={16} />
                  نبذة شخصية
                </h3>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile?.experience_years && (
              <div className="text-right">
                <h3 className="font-semibold mb-2 flex items-center gap-2 justify-end">
                  <Briefcase size={16} />
                  سنوات الخبرة
                </h3>
                <p className="text-muted-foreground">{profile.experience_years} سنة</p>
              </div>
            )}

            {providerServices && providerServices.length > 0 && (
              <div className="text-right">
                <h3 className="font-semibold mb-3 flex items-center gap-2 justify-end">
                  <Calendar size={16} />
                  الخدمات المتاحة ({providerServices.length})
                </h3>
                <div className="space-y-2">
                  {providerServices.map((svc) => (
                    <div 
                      key={svc.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <Badge variant="outline">{svc.category}</Badge>
                      <span className="font-medium">{svc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.created_at && (
              <div className="text-right pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  عضو منذ: {new Date(profile.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProviderProfileModal;