import { useServiceData } from "@/hooks/usePublicServices";
import ServiceView from "./ServiceView";

export const ServiceViewWrapper = ({ serviceId }: { serviceId: string }) => {
  const { data: service } = useServiceData(serviceId); // hook inside Suspense
  return <ServiceView service={service} />
}