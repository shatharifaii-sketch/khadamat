import { supabase } from "@/integrations/supabase/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/components/Admin/ui/UserForm";
import { Json, Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { ServiceLink } from "@/components/PostService/ServiceLinks";
import { useEmail } from "./useEmail";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { errorMessages } from "@/types/analytics";
import { validateAdminUserForm } from "@/utils/formValidation";
import { toSearchTerm } from "@/utils/utils";

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
  whatsapp_number?:
    | {
        countryCode: string;
        number: string;
      }
    | string;
  publisher: {
    full_name: string;
  };
  service_media: {
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
    thumbnail_url?: string;
    type?: "image" | "video";
  }[];
  with_appointments: boolean;
}

type Pagination = {
  usersCursor?: number | null;
  servicesCursor?: number | null;
  pendingServicesCursor?: number | null;
  couponsCursor?: number | null;
  search?: string;
  sort?: "name-desc" | "name-asc" | "date-asc" | "date-desc" | "code-name";
};

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

export const PAGE_SIZE = 10;

async function deleteServiceMedia(
  serviceId: string,
  mediaData?: {
    url: string;
    type: string;
    thumbnail_url?: string;
  }[],
) {
  const { error } = await supabase
    .from("service_media")
    .delete()
    .eq("service_id", serviceId);

  if (error) return { success: false, error };

  const imagesToDelete =
    mediaData
      ?.filter((media) => media.type === "image")
      .map((media) => media.url) ?? [];
  const videosToDelete =
    mediaData
      ?.filter((media) => media.type === "video")
      .map((video) => video.url) ?? [];
  const thumbnailsToDelete =
    mediaData
      ?.filter((media) => media.thumbnail_url)
      ?.map((media) => media.thumbnail_url) ?? [];

  if (imagesToDelete.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("service-images")
      .remove(imagesToDelete ?? []);

    if (storageError) return { success: false, error: storageError };
  }

  if (videosToDelete.length > 0) {
    const { error: videoStorageError } = await supabase.storage
      .from("service-videos")
      .remove(videosToDelete ?? []);

    if (videoStorageError) return { success: false, error: videoStorageError };
  }

  if (thumbnailsToDelete.length > 0) {
    const { error: thumbnailStorageError } = await supabase.storage
      .from("service-thumbnails")
      .remove(thumbnailsToDelete ?? []);

    if (thumbnailStorageError)
      return { success: false, error: thumbnailStorageError };
  }

  return { success: true };
}

export const useIsAdmin = () => {
  const { user } = useAuth();

  const { data, error, isLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("is_admin", { uid: user?.id });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (error) throw error;

  return {
    isAdmin: data ?? false,
    isLoading,
  };
};

export const useAdminData = () => {
  const { isAdmin, isLoading } = useIsAdmin();

  const [profilesQuery, servicesQuery, pendingServicesQuery, couponsQuery] =
    useSuspenseQueries({
      queries: [
        //Users query
        {
          queryKey: ["profiles"],
          queryFn: async () => {
            const query = supabase.from("profiles_with_email");

            if (!isAdmin && !isLoading) return null;

            const {
              data,
              count: usersCount,
              error: numQueryError,
            } = await query.select("id, created_at", { count: "exact" });

            if (numQueryError) throw numQueryError;

            return {
              data,
              usersCount,
            };
          },
        },

        // Published services
        {
          queryKey: ["services"],
          queryFn: async () => {
            const query = supabase
              .from("services")
              .select("id, user_id", { count: "exact" });

            if (!isAdmin && !isLoading) return null;

            const {
              data,
              count: servicesCount,
              error: numQueryError,
            } = await query;

            if (numQueryError) throw numQueryError;

            const { count: pubServicesCount, error: pubNumQueryError } =
              await query.eq("status", "published");

            if (pubNumQueryError) throw pubNumQueryError;

            return {
              data,
              servicesCount,
              pubServicesCount,
            };
          },
        },

        //Pending services query
        {
          queryKey: ["pending-services"],
          queryFn: async () => {
            const query = supabase.from("services");

            if (!isAdmin && !isLoading) return null;

            const { count: pendServicesCount, error: numQueryError } =
              await query
                .select("id", { count: "exact", head: true })
                .eq("status", "pending-approval");

            if (numQueryError) throw numQueryError;

            return pendServicesCount;
          },
        },

        //Coupons query
        {
          queryKey: ["coupons"],
          queryFn: async () => {
            const query = supabase.from("coupons");

            if (!isAdmin && !isLoading) return null;

            const { count: couponsCount, error: numQueryError } =
              await query.select("id", { count: "exact", head: true });

            if (numQueryError) throw numQueryError;

            return couponsCount;
          },
        },
      ],
    });

  const uniqueServiceProviders = servicesQuery.data.data
    .map((service) => service.user_id)
    .filter((value, index, self) => self.indexOf(value) === index).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySignups = profilesQuery.data.data.filter(
    (user) => new Date(user.created_at) >= todayStart,
  ).length;

  const stats = {
    totalUsers: profilesQuery.data.usersCount,
    serviceProviders: uniqueServiceProviders,
    totalServices: servicesQuery.data.servicesCount,
    publishedServices: servicesQuery.data.pubServicesCount,
    todaySignups: todaySignups,
    couponsCount: couponsQuery.data,
    pendingServicesCount: pendingServicesQuery.data,
  };

  return {
    stats,
  };
};

export const useUsers = ({ usersCursor, sort, search }: Pagination) => {
  const term = toSearchTerm(search ?? "");

  const { data: usersData, isLoading: usersDataLoading } = useSuspenseQuery({
    queryKey: ["admin-users-data", usersCursor, sort, search],
    queryFn: async () => {
      console.log(sort);
      let listQuery = supabase
        .from("profiles_with_email")
        .select("*", { count: "exact" });

      // switch (sort) {
      //   case "date-asc":
      //     listQuery = listQuery.order("created_at", { ascending: true });

      //     break;
      //   case "date-desc":
      //     listQuery = listQuery.order("created_at", { ascending: false });

      //     break;
      //   case "name-asc":
      //     listQuery = listQuery.order("full_name", { ascending: true });

      //     break;
      //   case "name-desc":
      //     listQuery = listQuery.order("full_name", { ascending: false });

      //     break;
      //   default:
      //     listQuery = listQuery.order("user_index", {
      //       ascending: true,
      //     });
      // }
      if (term) {
        listQuery = listQuery.or(
          `full_name.ilike.*${term}*,email.ilike.*${term}*,phone.ilike.*${term}*`,
        );
      }

      listQuery = listQuery.order("created_at", { ascending: true });
      listQuery = listQuery.limit(PAGE_SIZE + 1);

      if (usersCursor !== null) {
        listQuery = listQuery.gt("user_index", usersCursor);
      }

      const { data, error, count } = await listQuery;

      if (error) throw error;

      return { rows: data, total: count ?? 0 };
    },
  });

  const {
    data: { roles, counts },
    isLoading: rolesQueryLoading,
  } = useSuspenseQuery({
    queryKey: ["user-roles"],
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const {
        data: { data, error },
      } = await supabase.functions.invoke("get-roles");

      if (error) throw error;

      return data;
    },
  });

  const { rows } = usersData;

  const adminSet = useMemo(
    () =>
      new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id)),
    [roles],
  );

  const profiles = useMemo(() => {
    return rows.map((profile) => ({
      ...profile,
      is_admin: adminSet.has(profile.id),
    }));
  }, [rows, adminSet]);

  const hasNextPage = rows.length > PAGE_SIZE;

  const nextCursor = hasNextPage ? rows[PAGE_SIZE - 1].user_index : null;

  return {
    usersList: profiles.slice(0, PAGE_SIZE),
    nextCursor,
    hasNextPage,
    isLoading: usersDataLoading || rolesQueryLoading,
    numOfUsers: term ? usersData.total : counts.userCount,
  };
};

export const useServices = ({ servicesCursor, sort, search }: Pagination) => {
  const term = toSearchTerm(search ?? "");

  const [
    { data: servicesData, isLoading: servicesDataLoading },
    { data: servicesCount },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["admin-services-data", servicesCursor, sort, term],
        queryFn: async () => {
          let listQuery = supabase
            .from("services")
            .select(
              `
              *,
              publisher:fk_services_user_id (
                full_name
              ),
              service_media (
                id,
                name,
                url,
                thumbnail_url,
                type
              )
            `,
            )
            .eq("status", "published");

          // switch (sort) {
          //   case "date-asc":
          //     listQuery = listQuery.order("created_at", { ascending: true });

          //     break;
          //   case "date-desc":
          //     listQuery = listQuery.order("created_at", { ascending: false });

          //     break;
          //   case "name-asc":
          //     listQuery = listQuery.order("title", { ascending: true });

          //     break;
          //   case "name-desc":
          //     listQuery = listQuery.order("title", { ascending: false });

          //     break;
          //   default:
          //     listQuery = listQuery.order("service_index", {
          //       ascending: true,
          //     });
          // }

          if (term) listQuery = listQuery.ilike("title", `%${term}%`);
          listQuery = listQuery.order("created_at", { ascending: true });
          listQuery = listQuery.limit(PAGE_SIZE + 1);

          if (servicesCursor != null) {
            listQuery = listQuery.gt("service_index", servicesCursor);
          }

          const { data, error } = await listQuery;

          if (error) throw error;

          return data;
        },
      },
      {
        queryKey: ["admin-services-count", term],
        queryFn: async () => {
          let countQuery = supabase
            .from("services")
            .select("id", { count: "exact", head: true })
            .eq("status", "published");

          if (term) countQuery = countQuery.ilike("title", `%${term}%`);

          const { count, error } = await countQuery;
          if (error) throw error;
          return count ?? 0;
        },
      },
    ],
  });

  const hasNextPage = servicesData.length > PAGE_SIZE;
  const nextCursor = hasNextPage
    ? servicesData[PAGE_SIZE - 1].service_index
    : null;

  return {
    servicesList: servicesData.slice(0, PAGE_SIZE),
    nextCursor,
    hasNextPage,
    servicesCount,
    servicesDataLoading,
  };
};

export const usePendingServices = ({
  pendingServicesCursor,
  sort,
  search,
}: Pagination) => {
  const term = toSearchTerm(search ?? "");

  const [
    { data: rows, isLoading: pendingServicesDataLoading },
    { data: pendServicesCount },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: [
          "admin-pending-services-data",
          pendingServicesCursor,
          sort,
          term,
        ],
        queryFn: async () => {
          let listQuery = supabase
            .from("services")
            .select(
              `
              *,
              publisher:fk_services_user_id (
                full_name
              ),
              service_media (
                id,
                name,
                url,
                thumbnail_url,
                type
              )
            `,
            )
            .eq("status", "pending-approval");

          // switch (sort) {
          //   case "date-asc":
          //     listQuery = listQuery.order("created_at", { ascending: true });

          //     break;
          //   case "date-desc":
          //     listQuery = listQuery.order("created_at", { ascending: false });

          //     break;
          //   case "name-asc":
          //     listQuery = listQuery.order("title", { ascending: true });

          //     break;
          //   case "name-desc":
          //     listQuery = listQuery.order("title", { ascending: false });

          //     break;
          //   default:
          //     listQuery = listQuery.order("service_index", {
          //       ascending: true,
          //     });
          // }

          if (term) listQuery = listQuery.ilike("title", `%${term}%`);
          listQuery = listQuery.order("created_at", { ascending: true });
          listQuery = listQuery.limit(PAGE_SIZE + 1);

          if (pendingServicesCursor != null) {
            listQuery = listQuery.gt("service_index", pendingServicesCursor);
          }

          const { data, error } = await listQuery;

          if (error) throw error;

          return data;
        },
      },
      {
        queryKey: ["pending-services-count", term],
        queryFn: async () => {
          let countQuery = supabase
            .from("services")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending-approval");

          if (term) countQuery = countQuery.ilike("title", `%${term}%`);

          const { count, error } = await countQuery;
          if (error) throw error;
          return count ?? 0;
        },
      },
    ],
  });

  const hasNextPage = rows.length > PAGE_SIZE;

  const nextCursor = hasNextPage ? rows[PAGE_SIZE - 1].service_index : null;

  return {
    pendingServicesList: rows.slice(0, PAGE_SIZE),
    hasNextPage,
    nextCursor,
    pendServicesCount,
    pendingServicesDataLoading,
  };
};

export const useCoupons = ({ couponsCursor, sort, search }: Pagination) => {
  const term = toSearchTerm(search ?? "");
  const [{ data: rows, isLoading: couponsDataLoading }, { data: couponCount }] =
    useSuspenseQueries({
      queries: [
        {
          queryKey: ["admin-coupons-data", couponsCursor, sort, term],
          queryFn: async () => {
            let listQuery = supabase.from("coupons").select("*");

            // switch (sort) {
            //   case "date-asc":
            //     listQuery = listQuery.order("created_at", { ascending: true });

            //     break;
            //   case "date-desc":
            //     listQuery = listQuery.order("created_at", { ascending: false });

            //     break;
            //   case "code-name":
            //     listQuery = listQuery.order("code", { ascending: true });

            //     break;
            //   default:
            //     listQuery = listQuery.order("coupon_index", {
            //       ascending: true,
            //     });
            // }

            if (term) {
              listQuery = listQuery.ilike("code", `%${term}%`);
            }
            listQuery = listQuery.order("created_at", { ascending: true });
            listQuery = listQuery.limit(PAGE_SIZE + 1);

            if (couponsCursor != null) {
              listQuery = listQuery.gt("coupon_index", couponsCursor);
            }

            const { data, error } = await listQuery;

            if (error) throw error;

            return data;
          },
        },
        {
          queryKey: ["coupons-count", term],
          queryFn: async () => {
            let countQuery = supabase
              .from("services")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending-approval");

            if (term) countQuery = countQuery.ilike("title", `%${term}%`);

            const { count, error } = await countQuery;
            if (error) throw error;
            return count ?? 0;
          },
        },
      ],
    });

  const hasNextPage = rows.length > PAGE_SIZE;
  const nextCursor = hasNextPage ? rows[PAGE_SIZE - 1].coupon_index : null;

  return {
    couponsList: rows.slice(0, PAGE_SIZE),
    hasNextPage,
    nextCursor,
    couponCount,
    couponsDataLoading,
  };
};

export const useAdminFunctionality = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("responses");
  const { sendPasswordUpdateEmail } = useEmail();

  const { isAdmin: admin, isLoading: adminLoading} = useIsAdmin();

  const createUser = useMutation({
    mutationFn: async (formData: Partial<User>) => {
      // Implement user creation logic here
      if (!admin && !adminLoading) {
        throw new Error("Only admins can create users");
      }

      const res = validateAdminUserForm(formData);

      if (!res.isValid) {
        toast.error(t(res.message));
        throw new Error(res.message);
      }

      console.log("Creating user...");

      const { data, error } = await supabase.functions.invoke(
        "admin-create-user",
        {
          body: {
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            is_admin: admin,
            full_name: formData.full_name,
            admin: formData.is_admin,
            verify_email: formData.verify_email,
            verify_phone: formData.verify_phone,
          },
        },
      );

      const { success, user, error: userError } = data;

      if (userError || error) {
        console.log(userError);
        const errorCode =
          typeof userError === "string" ? userError : userError?.code;

        toast.error(t(errorMessages[errorCode ?? ""] ?? "user_creation_error"));
        throw userError ?? error;
      }

      if (
        formData.verify_email &&
        formData.email &&
        formData.email.length > 0
      ) {
        await sendPasswordUpdateEmail.mutateAsync({ email: formData.email! });
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio ?? "",
          experience_years: formData.experience_years ?? 0,
          is_service_provider: formData.is_service_provider ?? false,
          profile_image_url: "",
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      return;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-users-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
        ...(variables.is_admin !== undefined
          ? [
              queryClient.invalidateQueries({
                queryKey: ["user-roles"],
              }),
            ]
          : []),
      ]);
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { error } = await supabase.functions.invoke("admin-delete-user", {
        body: {
          id,
          is_admin: admin,
        },
      });

      if (error) throw error;

      return;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-users-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
  });

  const setupRealTimeSubscriptions = () => {
    // Real-time subscription for new users
    const profilesChannel = supabase
      .channel("profiles-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          console.log("New user registered:", payload.new);
          toast(t("new_user"), {
            description: `انضم ${payload.new.full_name || t("new_user")} للموقع`,
          });
          queryClient.invalidateQueries({ queryKey: ["admin-data"] });
        },
      )
      .subscribe();

    // Real-time subscription for new services
    const servicesChannel = supabase
      .channel("services-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "services" },
        (payload) => {
          console.log("New service posted:", payload.new);
          toast(t("new_service"), {
            description: `${t("new_service_added")}: ${payload.new.title}`,
          });
          queryClient.invalidateQueries({ queryKey: ["admin-data"] });
        },
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

      const res = formData.password
        ? validateAdminUserForm(formData)
        : {
            isValid: true,
            message: "",
          };

      console.log(res);

      if (!res.isValid) {
        toast.error(t(res.message));
        throw new Error(res.message);
      }

      if (
        formData.email ||
        formData.password ||
        formData.phone ||
        formData.is_admin !== undefined
      ) {
        const { data, error } = await supabase.functions.invoke(
          "admin-update-user",
          {
            body: {
              id: formData.id,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              is_admin: admin,
              admin: formData.is_admin,
              full_name: formData.full_name,
              verify_email: formData.verify_email,
              verify_phone: formData.verify_phone,
            },
          },
        );

        const { success, error: updateError } = data;

        if (updateError || error) {
          const errorCode =
            typeof updateError === "string" ? updateError : updateError?.code;

          toast.error(
            t(errorMessages[errorCode ?? ""] ?? "user_creation_error"),
          );

          throw updateError ?? error;
        }

        if (formData.email && formData.password && formData.verify_email) {
          await sendPasswordUpdateEmail.mutateAsync({ email: formData.email });
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          is_service_provider: formData.is_service_provider,
          experience_years: formData.experience_years,
        })
        .eq("id", formData.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;

      return;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-users-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
        ...(variables.is_admin !== undefined
          ? [
              queryClient.invalidateQueries({
                queryKey: ["user-roles"],
              }),
            ]
          : []),
      ]);
    },
    onError: () => {},
  });

  const deleteService = useMutation({
    mutationFn: async ({
      id,
      provider_id,
    }: {
      id: string;
      provider_id: string;
    }) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data: serviceMediaData, error: serviceMediaError } =
        await supabase
          .from("service_media")
          .select("url, type, thumbnail_url")
          .eq("service_id", id);

      if (serviceMediaError) throw serviceMediaError;

      const mediaData =
        serviceMediaData?.map((media) => {
          return {
            url: media.url,
            type: media.type,
            thumbnail_url: media.thumbnail_url,
          };
        }) ?? [];

      const { success, error: deleteMediaError } = await deleteServiceMedia(
        id,
        mediaData,
      );

      if (!deleteMediaError && !success) {
        throw new Error("error_deleting_service_media");
      }

      if (deleteMediaError) {
        console.error("Error deleting service media:", deleteMediaError);
        throw deleteMediaError;
      }

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;

      const { data: servicesUsedData, error: servicesUsedError } =
        await supabase
          .rpc("get_services_used", { user_id: provider_id })
          .single();

      if (servicesUsedError) throw servicesUsedError;

      const curresntUsed = servicesUsedData ?? 0;

      const { error: subError } = await supabase
        .from("subscriptions")
        .update({
          services_used: Math.max(curresntUsed - 1, 0),
        })
        .eq("user_id", provider_id);

      if (subError) throw subError;

      return;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-services-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-services-count"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
  });

  const createService = useMutation({
    mutationFn: async (formData: Partial<Service>) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data, error: serviceError } = await supabase
        .from("services")
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
          whatsapp_number: String(formData.whatsapp_number),
        })
        .select("*")
        .single();

      if (serviceError) throw serviceError;

      if (formData.service_media) {
        for (const image of formData.service_media) {
          const { error: imageError } = await supabase
            .from("service_media")
            .insert({
              service_id: data?.id,
              url: image.url,
              name: image.name,
              thumbnail_url: image.thumbnail_url,
              type: image.type,
            });

          if (imageError) throw imageError;
        }
      }

      return;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-services-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-services-count"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
  });

  const updateService = useMutation({
    mutationFn: async (formData: Partial<Service>) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data, error } = await supabase
        .from("services")
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
          whatsapp_number: String(formData.whatsapp_number),
        })
        .eq("id", formData.id)
        .select("*")
        .single();

      if (formData.service_media) {
        for (const image of formData.service_media) {
          const { error: imageError } = await supabase
            .from("service_media")
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-services-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-services-count"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
  });

  const acceptServicePost = useMutation({
    mutationKey: ["accept-service-post"],
    mutationFn: async (serviceId: string) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }
      const { error } = await supabase
        .from("services")
        .update({ status: "published" })
        .eq("id", serviceId);

      if (error) {
        console.error("Error accepting service post:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-pending-services-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-pending-services-count"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
      toast.success(t("service_approved"));
    },
    onError: (error: Error) => {
      console.error("Error updating service:", error);
      toast.error(error.message || t("service_update_error"));
    },
  });

  const createCoupon = useMutation({
    mutationKey: ["create-coupon"],
    mutationFn: async (formData: Partial<Tables<"coupons">>) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }
      const { data: couponData, error: couponError } =
        await supabase.functions.invoke("create-coupons-with-stripe", {
          body: JSON.stringify({ formData }),
        });

      if (couponError) {
        console.log("Error creating coupon:", couponError);
        throw couponError;
      }

      const { data, error } = await supabase
        .from("coupons")
        .insert({
          code: formData.code.trim().toUpperCase() || "",
          type: formData.type || "fixed",
          discount_amount: formData.discount_amount || 0,
          discount_percentage: formData.discount_percentage || null,
          usage_limit: formData.usage_limit || null,
          used_count: 0,
          description: formData.description || "",
          expires_at: formData.expires_at || null,
          stripe_coupon_id: couponData.coupon.id,
          stripe_promo_id: couponData.promotionCode.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating coupon:", error);
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-coupons-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const deleteCoupon = useMutation({
    mutationFn: async (couponId: string) => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", couponId);

      if (error) {
        console.error("Error deleting coupon:", error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin-coupons-data"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-data"],
        }),
      ]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });

  const {
    data: serviceProviders,
    isLoading: loadingServiceProviders,
    isError: errorLoadingServiceProviders,
  } = useQuery({
    queryKey: ["service-providers"],
    queryFn: async () => {
      if (!admin) {
        throw new Error("Only admins can delete users");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, profile_image_url")
        .eq("is_service_provider", true);

      if (error) {
        console.error("Error loading service providers");
        toast.error("error_service_providers");
        return [];
      }

      return data;
    },
  });

  const isUserMember = async (id: string) => {
    if (!id || id.length < 1) {
      console.error("error getting user data");
      throw new Error("no_id");
    }

    const { count, error } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("status", "active");

    if (error) {
      console.error("error getting user data");
      throw new Error("error_getting_user_sub");
    }

    return count > 0;
  };

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
    acceptServicePost,
    serviceProviders,
    loadingServiceProviders,
    errorLoadingServiceProviders,
    isUserMember,
  };
};
