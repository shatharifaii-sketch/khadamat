import { useServiceData } from "@/hooks/usePublicServices";
import ServiceView from "./ServiceView";
import { useServiceViews } from "@/hooks/useServiceViews";
import { useEffect } from "react";

interface Props {
    serviceId: string;
}

export const ServiceViewWrapper = ({ serviceId }: Props) => {
  const service = useServiceData(serviceId);

  return <ServiceView service={service} />
}