import ServiceView from "@/components/Service/ServiceView"
import { useParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useServiceData } from "@/hooks/usePublicServices";

const ServicePage = () => {
    const { id: serviceId } = useParams<{id: string}>();

    const { data: service } = useServiceData(serviceId!)

    console.log(service)
  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <div className="flex items-center justify-center">
                <h1 className="text-4xl font-bold">معلومات الخدمة</h1>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ServiceView service={service} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default ServicePage