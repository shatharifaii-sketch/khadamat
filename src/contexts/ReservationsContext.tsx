import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toMinutes } from "@/lib/utils";
import { toast } from "sonner";

export interface Reservation {
  id: string;
  date: string | null;
  created_at: string | null;
  client: {
    id: string;
    full_name: string;
  } | null;
  provider: {
    id: string;
    full_name: string;
  } | null;
  service: {
    id: string;
    title: string;
  } | null;
  status: string | null;
  provider_seen: boolean | null;
  client_seen: boolean | null;
  start_time: string;
  end_time: string;
}

export interface ReservationList {
  id: string;
  date: string | null;
  created_at: string | null;
  client_id: string | null;
  provider_id: string | null;
  service_id: string | null;
  status: string | null;
  provider_seen: boolean | null;
  client_seen: boolean | null;
  start_time: string;
  end_time: string;
}

interface ProviderAvailability {
  id: string;
  from_time: string;
  to_time: string;
  from_date: string;
  to_date: string;
  provider: {
    id: string;
    full_name: string;
  };
  created_at: string;
  service: {
    id: string;
    title: string;
  };
}

interface ProviderAvailabilityList {
  id: string;
  from_time: string;
  to_time: string;
  from_date: string;
  to_date: string;
  provider_id: string;
  service_id: string;
  created_at: string;
}

export type ReservationForm = {
  providerId: string;
  clientId: string;
  serviceId?: string;
  date: string;
  start_time: string;
  end_time: string;
};

interface ReservationContextType {
  reservations: Reservation[];
  loading: boolean;
  unseenCount: number;

  createReservation: (
    reservation: ReservationForm,
  ) => Promise<{ success: boolean; error: string | null }>;
  updateReservation: (
    reservation: ReservationForm,
  ) => Promise<{ success: boolean; error: string | null }>;
  acceptReservation: ({
    reservationId,
  }: {
    reservationId: string;
  }) => Promise<{ success: boolean; error: string | null }>;
  declineReservation: ({
    reservationId,
  }: {
    reservationId: string;
  }) => Promise<{ success: boolean; error: string | null }>;
  cancelReservation: ({
    reservationId,
  }: {
    reservationId: string;
  }) => Promise<{ success: boolean; error: string | null }>;
  markSeen: ({
    reservationId,
  }: {
    reservationId: string;
  }) => Promise<{ success: boolean; error: string | null }>;

  refresh(): Promise<void>;
}

const ReservationsContext = createContext<ReservationContextType | null>(null);

export const ReservationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation("reservations");
  const lang = localStorage.getItem("language") || "en";

  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const loadReservations = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("calendar_reservations")
      .select(
        `
            *,
            client:profiles!calendar_reservations_client_id_fkey(
            id,
            full_name
        ),
        provider:profiles!calendar_reservations_provider_id_fkey(
        id,
        full_name
        ),
        service:services!calendar_reservations_service_id_fkey(
        id,
        title
        )
            `,
      )
      .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("date");

    if (error) {
      console.error("Error fetching reservations:", error);
      throw error;
    }

    setReservations(data as Reservation[]);
    setLoading(false);
  }, [user]);

  const createReservation = async (reservation: ReservationForm) => {
    if (!reservation.clientId || !reservation.providerId || !reservation.date) {
      const error = "more_data_needed";
      toast.error(error);
      return { success: false, error };
    }

    const { data: checkProvider, error: checkError } =
      await supabase.functions.invoke("check-provider-availability", {
        body: JSON.stringify({
          providerId: reservation.providerId,
          serviceId: reservation.serviceId,
          start_time: reservation.start_time,
          end_time: reservation.end_time,
          date: reservation.date,
        }),
      });

    if (checkError) {
      console.error("error occurred", checkError);
      toast.error(t("unexpected_error_occured"));

      return { success: false, error: "unexpected_error_occured" };
    }

    if (!checkProvider.success && checkProvider.error) {
      console.error("error occurred", checkProvider.error);
      toast.error(t(checkProvider.message ?? "unexpected_error_occured"));

      return { success: false, error: checkProvider.error };
    }

    const { error } = await supabase.from("calendar_reservations").insert({
      client_id: reservation.clientId,
      provider_id: reservation.providerId,
      service_id: reservation.serviceId,
      date: reservation.date,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      status: "pending",
      provider_seen: false,
      client_seen: true,
    });

    if (error) {
      console.error("Error creating reservation: ", error);
      throw error;
    }

    return { success: true, error: null };
  };

  const updateReservation = async ({
    reservationId,
    ...reservation
  }: ReservationForm & { reservationId: string }) => {
    if (!reservation.clientId || !reservation.providerId || !reservation.date) {
      const error = "more_data_needed";
      toast.error(error);
      return { success: false, error };
    }

    const { data: checkProvider, error: checkError } =
      await supabase.functions.invoke("check-provider-availability", {
        body: JSON.stringify({
          providerId: reservation.providerId,
          serviceId: reservation.serviceId,
          start_time: reservation.start_time,
          end_time: reservation.end_time,
          date: reservation.date,
        }),
      });

    if (checkError) {
      console.error("error occurred", checkError);
      toast.error(t("unexpected_error_occured"));

      return { success: false, error: "unexpected_error_occured" };
    }

    if (!checkProvider.success && checkProvider.error) {
      console.error("error occurred", checkProvider.error);
      toast.error(t(checkProvider.message ?? "unexpected_error_occured"));

      return { success: false, error: checkProvider.error };
    }

    const { error } = await supabase
      .from("calendar_reservations")
      .update({
        client_id: reservation.clientId,
        provider_id: reservation.providerId,
        service_id: reservation.serviceId,
        date: reservation.date,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        status: "pending",
        provider_seen: false,
        client_seen: true,
      })
      .eq("id", reservationId);

    if (error) {
      console.error("Error creating reservation: ", error);
      throw error;
    }

    return { success: true, error: null };
  };

  const acceptReservation = async ({
    reservationId,
  }: {
    reservationId: string;
  }) => {
    if (!reservationId) {
      const error = "no_reservation_found";
      toast.error(error);
      return { success: false, error };
    }

    const { error } = await supabase
      .from("calendar_reservations")
      .update({
        status: "accepted",
      })
      .eq("id", reservationId);

    if (error) {
      console.error(error);
      toast.error(t("unexpected_error_occured"));
      throw error;
    }

    return { success: true, error: null };
  };

  const declineReservation = async ({
    reservationId,
  }: {
    reservationId: string;
  }) => {
    if (!reservationId) {
      const error = "no_reservation_found";
      toast.error(error);
      return { success: false, error };
    }

    const { error } = await supabase
      .from("calendar_reservations")
      .update({
        status: "declined",
      })
      .eq("id", reservationId);

    if (error) {
      console.error(error);
      toast.error(t("unexpected_error_occured"));
      throw error;
    }

    return { success: true, error: null };
  };

  const cancelReservation = async ({
    reservationId,
  }: {
    reservationId: string;
  }) => {
    if (!reservationId) {
      const error = "no_reservation_found";
      toast.error(error);
      return { success: false, error };
    }

    const { error } = await supabase
      .from("calendar_reservations")
      .update({
        status: "cancelled",
      })
      .eq("id", reservationId);

    if (error) {
      console.error(error);
      toast.error(t("unexpected_error_occured"));
      throw error;
    }

    return { success: true, error: null };
  };

  const markSeen = async ({ reservationId }: { reservationId: string }) => {
    if (!reservationId || !user?.id) {
      const error = "no_reservation_found";
      toast.error(error);
      return { success: false, error };
    }

    const { data, error } = await supabase
      .from("calendar_reservations")
      .select("id, client_id, provider_id")
      .eq("id", reservationId)
      .maybeSingle();

    if (error) {
      console.error(error);
      toast.error(t("unexpected_error_occured"));
      throw error;
    }

    const { error: updateError } = await supabase
      .from("calendar_reservations")
      .update({
        provider_seen: data?.provider_id == user?.id,
        client_seen: data?.client_id == user?.id,
      })
      .eq("id", data?.id);

    if (updateError) {
      console.error(updateError);
      toast.error(t("unexpected_error_occured"));
      throw updateError;
    }

    return { success: true, error: null };
  };

  const unseenCount = useMemo(() => {
    if (!user) return 0;

    return reservations.filter((r) => {
      if (r.provider.id === user.id) return !r.provider_seen;
      return !r.client_seen;
    }).length;
  }, [reservations, user]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("reservation-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar-reservations",
        },
        () => {
          loadReservations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadReservations, user]);

  return (
    <ReservationsContext.Provider
      value={{
        reservations,
        loading,
        unseenCount,
        createReservation,
        updateReservation,
        declineReservation,
        acceptReservation,
        cancelReservation,
        markSeen,
      }}
    >
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => useContext(ReservationsContext);
