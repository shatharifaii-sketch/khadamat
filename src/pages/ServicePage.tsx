import { useParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ServiceViewWrapper } from "@/components/Service/ServiceViewWrapper";
import ServiceLoading from "@/components/Service/ServiceLoading";


const ServicePage = () => {
    const { id: serviceId } = useParams<{id: string}>();

    if (!serviceId) {
    throw new Error('Service ID not found');
  };

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
            <div className="flex items-center justify-center">
                <h1 className="text-4xl font-bold">معلومات الخدمة</h1>
            </div>
            <Suspense fallback={<ServiceLoading />}>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ServiceViewWrapper serviceId={serviceId} />
            </ErrorBoundary>
        </Suspense>
    </div>
  )
}

export default ServicePage