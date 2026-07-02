import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/components/Admin/ui/UserForm";
import { Json, Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ServiceLink } from "@/components/PostService/ServiceLinks";
import { useEmail } from "./useEmail";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  is_service_provider: boolean;
  created_at: string;
  profile_image_url?: string;
  experience_years?: number;
}

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_online?: boolean;
  links: [] | ServiceLink[] | Json;
  whatsapp_number?: {
    countryCode: string;
    number: string;
  } | string;
  publisher: {
    full_name: string;
  };
  service_media: {
    id: string;
    name: string;
    url: string;
    thumbnail_url?: string;
    type?: 'image' | 'video';
  }[];
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  file?: File;
}

interface SaveImageProps {
  url: string;
  serviceId: string;
}

export const useIsAdmin = (): boolean => {
  const { user } = useAuth();

  const { data, error } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc('is_admin', { uid: user?.id });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  })

  if (error) throw error;

  return data ?? false;
}

export const useAdminData = () => {
  const admin = useIsAdmin();

  const { data: adminData } = useSuspenseQuery({
    queryKey: ['admin-data'],
    queryFn: async () => {
      const { data: profiles, error: usersError } = await supabase
        .from('profiles_with_email')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const { 
        data: { 
          success, 
          data: roles, 
          error 
        }, 
        error: rolesError 
      } = await supabase.functions.invoke("get-user-roles");

      if (rolesError) throw rolesError;

      const adminSet = new Set(
        roles
          .filter(r => r.role === "admin")
          .map(r => r.user_id)
      );

      const profilesWithAdminFlag = profiles.map(profile => ({
        ...profile,
        is_admin: adminSet.has(profile.id),
      }));

      console.log(profilesWithAdminFlag);

      const { data: services, error: servicesError } = await supabase.from('services')
        .select(`
        *,
        publisher:fk_services_user_id (
          full_name
        ),
        service_media (
        id,
      name,
      url,
      thumbnail_url
        )`)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      const { data: pendingServices, error: pendingServicesError } = await supabase.from('services')
        .select(`
        *,
        publisher:fk_services_user_id (
          full_name
        ),
        service_media (
        id,
      name,
      url,
      thumbnail_url
        )`)
        .eq('status', 'pending-approval')
        .order('created_at', { ascending: false });

      if (pendingServicesError) throw pendingServicesError;


      const { data: coupons, error: couponsError } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });

      if (couponsError) throw couponsError;

      // Calculate accurate metrics
      const uniqueServiceProviders = services.map(service => service.user_id).filter((value, index, self) => self.indexOf(value) === index).length;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todaySignups = profiles.filter(user =>
        new Date(user.created_at) >= todayStart
      ).length;

      const stats = {
        totalUsers: profiles.length,
        serviceProviders: uniqueServiceProviders,
        totalServices: services.length,
        publishedServices: services.filter(s => s.status === 'published').length,
        todaySignups: todaySignups
      };


      return {
        profiles: profilesWithAdminFlag,
        services,
        stats,
        coupons,
        pendingServices: pendingServices,
      };
    }
  });

  return {
    adminData
  };
}

export const useAdminFunctionality = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("responses")
  const { sendPasswordUpdateEmail } = useEmail();

  // Admin check - in a real app, you'd check this from the database
  const admin = useIsAdmin();

  const createUser = useMutation({
    mutationFn: async (formData: Partial<User>) => {
      // Implement user creation logic here
      if (!admin) {
        throw new Error("Only admins can create users");
      }

      console.log('Creating user...');

      const { data: { success, user, error: userError }, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          is_admin: formData.is_admin
        }
      });

      if (userError || error) {
        toast.error(userError.code === "email_exists" ? t("email_exists_error") : t("user_creation_error"));
        throw userError ?? error
      };

      await sendPasswordUpdateEmail.mutateAsync({ email: formData.email! });

      const { data: profile, error: profileError } = await supabase.from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio ?? '',
          experience_years: formData.experience_years ?? 0,
          is_service_provider: formData.is_service_provider ?? false,
          profile_image_url: '',
        })
        .eq('id', user.user?.id);

      if (profileError) throw profileError;

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { error } = await supabase.functions.invoke("admin-delete-user", {
        body: {
          id
        }
      });

      if (error) throw error;

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const setupRealTimeSubscriptions = () => {
    // Real-time subscription for new users
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('New user registered:', payload.new);
          toast(t("new_user"), {
            description: `انضم ${payload.new.full_name || t("new_user")} للموقع`,
          });
          queryClient.invalidateQueries({ queryKey: ['admin-data'] });
        }
      )
      .subscribe();

    // Real-time subscription for new services
    const servicesChannel = supabase
      .channel('services-realtime')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'services' },
        (payload) => {
          console.log('New service posted:', payload.new);
          toast(t("new_service"), {
            description: `${t("new_service_added")}: ${payload.new.title}`,
          });
          queryClient.invalidateQueries({ queryKey: ['admin-data'] });
        }
      )
      .subscribe();


    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(servicesChannel);
    };
  };

  const updateUser = useMutation({
    mutationFn: async (formData: Partial<User>) => {
      if (!admin) {
        throw new Error("Only admins can update users");
      }

      if (formData.email || formData.password || formData.phone) {
        const { data, error } = await supabase.functions.invoke("admin-update-user", {
          body: {
            id: formData.id,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            is_admin: formData.is_admin
          }
        });

        if (error || !data?.success) {
          toast.error(
            data?.error?.code === "email_exists"
              ? t("email_exists_error")
              : t("user_creation_error")
          );

          throw error || data?.error;
        }

        if (formData.email && formData.password) {
          await sendPasswordUpdateEmail.mutateAsync({ email: formData.email });
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          is_service_provider: formData.is_service_provider,
          experience_years: formData.experience_years
        })
        .eq('id', formData.id).select('id').maybeSingle();

      if (error) throw error;

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const createService = useMutation({
    mutationFn: async (formData: Partial<Service>) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data, error: serviceError } = await supabase
        .from('services')
        .insert({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          price_range: formData.price_range,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          experience: formData.experience,
          status: formData.status,
          user_id: formData.user_id,
          is_online: formData.is_online,
          links: formData.links as [],
          whatsapp_number: String(formData.whatsapp_number)
        })
        .select('*')
        .single();


      if (serviceError) throw serviceError;

      if (formData.service_media) {
        for (const image of formData.service_media) {
          const { error: imageError } = await supabase
            .from('service_media')
            .insert({
              service_id: data?.id,
              url: image.url,
              name: image.name,
              thumbnail_url: image.thumbnail_url,
            });

          if (imageError) throw imageError;
        }
      }

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const updateService = useMutation({
    mutationFn: async (formData: Partial<Service>) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data, error } = await supabase
        .from('services')
        .update({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          price_range: formData.price_range,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          experience: formData.experience,
          status: formData.status,
          is_online: formData.is_online,
          links: formData.links as [],
          whatsapp_number: String(formData.whatsapp_number)
        })
        .eq('id', formData.id)
        .select('*')
        .single();

      if (formData.service_media) {
        for (const image of formData.service_media) {
          const { error: imageError } = await supabase
            .from('service_media')
            .insert({
              service_id: data?.id,
              url: image.url,
              name: image.name,
              thumbnail_url: image.thumbnail_url,
            });

          if (imageError) throw imageError;
        }
      }

      if (error) throw error;

      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    }
  })

  const acceptServicePost = useMutation({
    mutationKey: ['accept-service-post'],
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .update({ status: 'published' })
        .eq('id', serviceId);

      if (error) {
        console.error('Error accepting service post:', error);
        return { success: false, error: error.message };
      };

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
      toast.success(t("service_approved"));
    },
    onError: (error: Error) => {
      console.error('Error updating service:', error);
      toast.error(error.message || t("service_update_error"));
    }
  })

  const createCoupon = useMutation({
    mutationKey: ['create-coupon'],
    mutationFn: async (formData: Partial<Tables<'coupons'>>) => {
      const { data: couponData, error: couponError } = await supabase.functions.invoke('create-coupons-with-stripe', {
        body: JSON.stringify({ formData })
      });

      if (couponError) {
        console.log('Error creating coupon:', couponError);
        throw couponError;
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: formData.code.trim().toUpperCase() || '',
          type: formData.type || 'fixed',
          discount_amount: formData.discount_amount || 0,
          discount_percentage: formData.discount_percentage || null,
          usage_limit: formData.usage_limit || null,
          used_count: 0,
          description: formData.description || '',
          expires_at: formData.expires_at || null,
          stripe_coupon_id: couponData.coupon.id,
          stripe_promo_id: couponData.promotionCode.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating coupon:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  })

  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      const { error } = await supabase.from('coupons').delete().eq('id', couponId);

      if (error) {
        console.error('Error deleting coupon:', error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  })

  return {
    deleteUser,
    setupRealTimeSubscriptions,
    updateUser,
    deleteService,
    updateService,
    createService,
    createUser,
    createUserSuccess: createUser.isSuccess,
    updateServiceSuccess: updateService.isSuccess,
    createServiceSuccess: createService.isSuccess,
    deleteUserSuccess: deleteUser.isSuccess,
    updateUserSuccess: updateUser.isSuccess,
    deleteServiceSuccess: deleteService.isSuccess,
    deleteCoupon,
    createCoupon,
    createCouponSuccess: createCoupon.isSuccess,
    acceptServicePost
  };
}