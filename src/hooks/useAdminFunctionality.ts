import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { User } from "@/components/Admin/ui/UserForm";
import { Tables } from "@/integrations/supabase/types";
import { json } from "react-router-dom";
import { toast } from "sonner";

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
  publisher: {
    full_name: string;
  };
  service_images: {
    id: string;
    image_name: string;
    image_url: string;
  }[]
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

export const isAdmin = (): boolean => {
  const { user } = useAuth();
  const { data, error } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('is_admin', { uid: user?.id });

      if (error) throw error;
      return data;
    }
  })

  if (error) throw error;

  return data;
}

export const useAdminData = () => {
  const admin = isAdmin();

  const { data: adminData } = useSuspenseQuery({
    queryKey: ['admin-data'],
    queryFn: async () => {
      const { data: profiles, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const { data: services, error: servicesError } = await supabase.from('services')
        .select(`
        *,
        publisher:fk_services_user_id (
          full_name
        ),
        service_images (
        id,
      image_name,
      image_url
        )`)
        .neq('status', 'pending-approval')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      const { data: pendingServices, error: pendingServicesError } = await supabase.from('services')
        .select(`
        *,
        publisher:fk_services_user_id (
          full_name
        ),
        service_images (
        id,
      image_name,
      image_url
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
        profiles,
        services,
        stats,
        coupons,
        pendingServices: pendingServices,
      };
    },
    initialData: {
      profiles: [],
      services: [],
      coupons: [],
      pendingServices: [],
      stats: {
        totalUsers: 0,
        serviceProviders: 0,
        totalServices: 0,
        publishedServices: 0,
        todaySignups: 0
      }
    }
  });

  return {
    adminData
  };
}

export const useAdminFunctionality = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Admin check - in a real app, you'd check this from the database
  const admin = isAdmin();

  const createUser = useMutation({
    mutationFn: async (formData: Partial<User>) => {
      // Implement user creation logic here
      if (!admin) {
        throw new Error("Only admins can create users");
      }

      console.log('Creating user...');

      const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })

      if (userError) throw userError;

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

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(id);

      if (deleteUserError) throw deleteUserError;

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
          toast("مستخدم جديد",{
            description: `انضم ${payload.new.full_name || 'مستخدم جديد'} للموقع`,
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
          toast("خدمة جديدة", {
            description: `تم إضافة خدمة جديدة: ${payload.new.title}`,
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
        throw new Error("Only admins can delete users");
      }

      if ((formData.email || formData.password)) {
        if (formData.email) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(formData.id!, { email: formData.email });
          if (error) throw error;
        }
        if (formData.password) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(formData.id!, { password: formData.password });
          if (error) throw error;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          is_service_provider: formData.is_service_provider,
          experience_years: formData.experience_years
        })
        .eq('id', formData.id);

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
        })
        .select('*')
        .single();


      if (serviceError) throw serviceError;

      if (formData.service_images) {
        for (const image of formData.service_images) {
          const { error: imageError } = await supabase
            .from('service_images')
            .insert({
              service_id: data?.id,
              image_url: image.image_url,
              image_name: image.image_name,
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
          status: formData.status
        })
        .eq('id', formData.id)
        .select('*')
        .single();

      if (formData.service_images) {
        for (const image of formData.service_images) {
          const { error: imageError } = await supabase
            .from('service_images')
            .insert({
              service_id: data?.id,
              image_url: image.image_url,
              image_name: image.image_name,
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
      toast.success('تم تحديث الخدمة بنجاح!');
    },
    onError: (error: any) => {
      console.error('Error updating service:', error);
      toast.error(error.message || 'حدث خطأ في تحديث الخدمة');
    }
  })

  const createCoupon = useMutation({
    mutationKey: ['create-coupon'],
    mutationFn: async (formData: Partial<Tables<'coupons'>>) => {
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

      return json({ success: true });
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