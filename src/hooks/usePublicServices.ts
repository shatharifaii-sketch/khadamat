import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Service } from "./useAdminFunctionality";
import { ServiceLink } from "@/components/PostService/ServiceLinks";
import { Reservation, ReservationList } from "@/contexts/ReservationsContext";
import { getReservationAvailability } from "@/lib/utils";

export interface PublicService {
  id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  views: number;
  created_at: string;
  user_id: string;
  is_online?: boolean;
  links: [];
  whatsapp_number?: string;
  updated_at: string;
  publisher: {
    id: string;
    full_name: string;
    profile_image_url: string;
  };
  average_rating: number;
  review_count: number;
  with_appointments: boolean;
}

export const usePublicServices = ({
  servicesCursor,
}: {
  servicesCursor?: number | null;
}) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    console.log("Setting up real-time subscription for services...");

    const channel = supabase
      .channel("public-services-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "services",
        },
        (payload) => {
          console.log("Real-time service change detected:", payload);

          // Invalidate and refetch the services data
          queryClient.invalidateQueries({ queryKey: ["public-services"] });
          queryClient.invalidateQueries({ queryKey: ["home-stats"] });
        },
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription for services");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["public-services", servicesCursor],
    queryFn: async () => {
      let listQuery = supabase
        .from("services")
        .select(
          `
    *,
    publisher:fk_services_user_id (
      id,
      full_name,
      profile_image_url
    )
  `,
        )
        .eq("status", "published")
        .order("service_index", { ascending: true })
        .limit(PAGE_SIZE + 1);

      const { count, error: countError } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      if (countError) {
        console.error("Error fetching public services count:", countError);
        return {
          services: [],
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        };
      }

      if (servicesCursor) {
        listQuery = listQuery.gt("service_index", servicesCursor);
      }

      const { data: services, error } = await listQuery;

      if (error) {
        console.error("Error fetching public services:", error);
        return {
          services: [],
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        };
      }

      const hasNextPage = services.length > PAGE_SIZE;

      const nextCursor = hasNextPage
        ? services[PAGE_SIZE - 1].service_index
        : null;

      return {
        services: services.slice(0, PAGE_SIZE),
        hasNextPage,
        nextCursor,
        count: count ?? 0,
      };
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

export const useServiceData = (id: string, userId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: ["service-with-convo", id, userId],
    queryFn: async () => {
      const [serviceRes] = await Promise.all([
        supabase
          .from("services")
          .select(
            `
            *,
            publisher:fk_services_user_id (
              id,
              full_name,
              profile_image_url
            )
          `,
          )
          .eq("status", "published")
          .eq("id", id)
          .single(),
      ]);

      if (serviceRes.error) throw serviceRes.error;

      return {
        service: serviceRes.data,
      };
    },
  });

  return data;
};

export const useServiceReservation = (id: string, userId: string) => {
  const { data } = useSuspenseQuery({
    queryKey: ["service-reservation"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_reservations")
        .select("*")
        .eq("id", id)
        .eq("client_id", userId)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false });

      if (error) throw error;

      return {
        latestReservation: data[0] as ReservationList ?? null,
        reservations: data,
        availabilty: getReservationAvailability(data)
      };
    },
  });

  return data;
};

export const useServiceToEditData = (id: string) => {
  const { data, isLoading } = useQuery({
    queryKey: ["service-edit-data", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return { service: null };

      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select(
          `
            *,
            publisher:fk_services_user_id (
              full_name
            )
            `,
        )
        .eq("id", id)
        .maybeSingle();

      if (serviceError) {
        console.log("Error fetching service data:", serviceError);
        throw serviceError;
      }

      const { data: media, error: imagesError } = await supabase
        .from("service_media")
        .select("*")
        .eq("service_id", id);

      if (imagesError) {
        console.log("Error fetching service images:", imagesError);
        throw imagesError;
      }

      const serviceImage = media.map((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        thumbnail_url: item.thumbnail_url,
        type: item.type,
      })) as Service["service_media"];

      const serviceRes = {
        ...serviceData,
        service_media: serviceImage,
      };

      return {
        service: serviceRes as Service,
      };
    },
  });

  return {
    service: data?.service,
    isLoading,
  };
};
