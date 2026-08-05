import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
  time: string;
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
  time: string;
}

interface ProviderAvailability {
  id: string;
  from_time: string;
  to_time: string;
  date: string;
  provider: {
    id: string;
    full_name: string;
  };
  created_at: string;
}

type ReservationForm = {
  providerId: string;
  clientId: string;
  serviceId?: string;
  date: string;
  time: string;
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

async function checkProviderAvailability({
  providerId,
  date,
  time,
  lang,
}: {
  providerId: string;
  date: string;
  time: string;
  lang: string;
}) {
  if (!providerId || !date || !time) {
    return {
      success: false,
      error: "more_data_needed",
    };
  }

  const { data, error } = await supabase
    .from("calendar_provider_availability")
    .select("from_time, to_time")
    .eq("provider_id", providerId)
    .eq("date", date);

  if (error)
    return {
      success: false,
      error: "unexpected_error_occured",
    };

  const requested = toMinutes(time);

  const available = data.some((slot) => {
    const from = toMinutes(slot.from_time!);
    const to = toMinutes(slot.to_time!);

    return requested >= from && requested < to;
  });

  if (!available) {
    return {
      success: false,
      error: "provider_not_available",
    };
  }

  const { data: otherReservations, error: otherError } = await supabase
    .from("calendar_reservations")
    .select("id")
    .eq("provider_id", providerId)
    .eq("date", date)
    .eq("time", time)
    .in("status", ["pending", "accepted"]);

  if (otherError)
    return { success: false, error: "failed_to_check_other_reservations" };

  if (otherReservations.length > 0)
    return { success: false, error: "provider_busy" };

  return {
    success: true,
    error: null,
  };
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
  }, [user]);

  const createReservation = async (reservation: ReservationForm) => {
    if (!reservation.clientId || !reservation.providerId || !reservation.date) {
      const error = "more_data_needed";
      toast.error(error);
      return { success: false, error };
    }

    const checkProvider = await checkProviderAvailability({
      providerId: reservation.providerId,
      date: reservation.date,
      time: reservation.time,
      lang,
    });

    if (!checkProvider.success && checkProvider.error) {
      console.error(checkProvider.error);
      toast.error(t(checkProvider.error));

      return { success: false, error: checkProvider.error };
    }

    const { error } = await supabase.from("calendar_reservations").insert({
      client_id: reservation.clientId,
      provider_id: reservation.providerId,
      service_id: reservation.serviceId,
      date: reservation.date,
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

    const checkProvider = await checkProviderAvailability({
      providerId: reservation.providerId,
      date: reservation.date,
      time: reservation.time,
      lang,
    });

    if (!checkProvider.success && checkProvider.error) {
      console.error(checkProvider.error);
      toast.error(t(checkProvider.error));

      return { success: false, error: checkProvider.error };
    }

    const { error } = await supabase
      .from("calendar_reservations")
      .update({
        client_id: reservation.clientId,
        provider_id: reservation.providerId,
        service_id: reservation.serviceId,
        date: reservation.date,
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
