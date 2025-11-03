import { useServiceData } from "@/hooks/usePublicServices";
import ServiceView from "./ServiceView";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface Props {
    serviceId: string;
}

export const ServiceViewWrapper = ({ serviceId }: Props) => {
  const { user } = useAuth();
  const {
    service
  } = useServiceData(serviceId, user?.id);
  const [isConvo, setIsConvo] = useState<boolean>(false);
  const [convoId, setConvoId] = useState<string>(null);

  return <ServiceView 
  service={service} 
  convoId={convoId}
  isConvo={isConvo}
  setConvoId={setConvoId}
  setIsConvo={setIsConvo}
  userId={user?.id}
  />
}