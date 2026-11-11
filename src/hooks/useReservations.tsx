import { AvailabilityType } from "@/contexts/ReservationsContext";
import { supabase } from "@/integrations/supabase/client";
import { ProviderAvailabilityFormValues } from "@/types/reservations";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

interface Props {
  providerId: string;
  serviceId?: string;
}

type fetchAvailabilityType = {
  providerId: string;
  serviceId: string;
};

type ProviderAvailability = {
  from_time: string;
  to_time: string;
  day_of_week: number;
};

type AvailabilityResponse = {
  success: boolean;
  error: string | null;
  data: ProviderAvailability[] | null;
};

export type ReservationsService = {
  id: string;
  title: string;
  price_range: string;
  location: string;
  is_online: boolean;
  with_appointments: boolean;
  availability: AvailabilityType[];
};

type ReservationsHookReturnType = {
  availabilityData: AvailabilityResponse | undefined;
  isAvailabilityDataError: boolean;
  isAvailabilityLoading: boolean;

  reservationsServices: ReservationsService[];
  isReservationsServicesError: boolean;
  isReservationsServicesLoading: boolean;

  updateAvailability: (availability: ProviderAvailabilityFormValues) => void;
  isUpdatingAvailability: boolean;
  isUpdatingAvailabilityError: boolean;
  isUpdatingAvailabilitySuccess: boolean;
};

async function getProviderAvailability({
  providerId,
  serviceId,
}: fetchAvailabilityType): Promise<{
  success: boolean;
  error: string;
  data: ProviderAvailability[];
}> {
  if (!providerId || !serviceId) {
    return {
      success: false,
      error: "more_data_required",
      data: null,
    };
  }

  const { data, error } = await supabase
    .from("calendar_provider_availability")
    .select("from_time, to_time, day_of_week")
    .eq("provider_id", providerId)
    .eq("service_id", serviceId);

  if (error) {
    return {
      success: false,
      error: "error_fetching_availability",
      data: null,
    };
  }

  return {
    success: true,
    error: null,
    data,
  };
}

const useReservations = ({
  serviceId,
  providerId,
}: Props): ReservationsHookReturnType => {
  const {
    data: availabilityData,
    isError: isAvailabilityDataError,
    isFetching: isAvailabilityLoading,
  } = useQuery({
    queryKey: ["service-provider-availability", providerId, serviceId],
    queryFn: () => getProviderAvailability({ providerId, serviceId }),
    enabled: !!(serviceId && providerId),
  });

  const {
    data: reservationsServices,
    isError: isReservationsServicesError,
    isFetching: isReservationsServicesLoading,
  } = useSuspenseQuery({
    queryKey: ["service-reservations", providerId],
    queryFn: async () => {
      if (!providerId) {
        return [] as ReservationsService[];
      }

      const { data, error } = await supabase
        .from("services")
        .select(
          `
        id,
          title,
          price_range,
          location,
          is_online,
          with_appointments,
          availability: calendar_provider_availability (
            dayOfWeek:day_of_week,
            fromTime:from_time,
            toTime:to_time
          )
        `,
        )
        .eq("user_id", providerId)
        .eq("with_appointments", true);

      if (error) {
        console.error("Error fetching reservations services: ", error);
        return [];
      }

      return data as ReservationsService[];
    },
  });

  const {
    mutate: updateAvailability,
    isPending: isUpdatingAvailability,
    isError: isUpdatingAvailabilityError,
    isSuccess: isUpdatingAvailabilitySuccess,
  } = useMutation({
    mutationFn: async (values: ProviderAvailabilityFormValues) => {
      if (!values || !serviceId || !providerId) return { success: false, error: "invalid_request" };

      const rows = values.availability.map((av) => ({
      provider_id: providerId,
      service_id: serviceId,
      day_of_week: av.dayOfWeek,
      from_time: av.fromTime,
      to_time: av.toTime,
    }));

      const { error } = await supabase
        .from("calendar_provider_availability")
        .upsert(rows, {
          onConflict: "provider_id,service_id,day_of_week"
        });
      
      if (error) {
        console.error("Error updating availability: ", error);

        throw {
          success: false,
          error: error.message
        }
      }

      return {
        success: true,
        error: null
      }
    },
  });

  return {
    availabilityData,
    isAvailabilityDataError,
    isAvailabilityLoading,

    reservationsServices,
    isReservationsServicesError,
    isReservationsServicesLoading,

    updateAvailability,
    isUpdatingAvailability,
    isUpdatingAvailabilityError,
    isUpdatingAvailabilitySuccess
  };
};

export default useReservations;
