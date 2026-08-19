import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  providerId: string;
  serviceId: string;
}

type fetchAvailabilityType = {
    providerId: string;
    serviceId: string
}

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

type ReservationsHookReturnType = {
  availabilityData: AvailabilityResponse | undefined;
  isAvailabilityDataError: boolean;
  isAvailabilityLoading: boolean;
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
    queryFn: () => getProviderAvailability({providerId, serviceId}),
    enabled: !!(serviceId && providerId),
  });

  return {
    availabilityData,
    isAvailabilityDataError,
    isAvailabilityLoading,
  };
};

export default useReservations;