import { useServiceData } from "@/hooks/usePublicServices";
import ServiceView from "./ServiceView";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface Props {
    serviceId: string;
}

export const ServiceViewWrapper = ({ serviceId }: Props) => {
  const { user } = useAuth();
  const {
    service,
    isConvo,
    convoId,
    setConvoId,
    setIsConvo
  } = useServiceData(serviceId, user?.id);

  return <ServiceView 
  service={service} 
  convoId={convoId}
  isConvo={isConvo}
  setConvoId={setConvoId}
  setIsConvo={setIsConvo}
  userId={user?.id}
  />
}