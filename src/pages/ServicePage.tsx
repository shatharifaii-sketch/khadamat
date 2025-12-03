import { useParams } from "react-router-dom";
import { Suspense, useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ServiceViewWrapper } from "@/components/Service/ServiceViewWrapper";
import ServiceLoading from "@/components/Service/ServiceLoading";
import Reviews from "@/components/Service/ui/Reviews";
import { Separator } from "@/components/ui/separator";
import LoadingReviews from "@/components/Service/ui/LoadingReviews";
import ReviewQueryError from "@/components/ErrorViews/ReviewQueryError";
import ServiceQueryError from "@/components/ErrorViews/ServiceQueryError";


const ServicePage = () => {
  const { id: serviceId } = useParams<{ id: string }>();

  if (!serviceId) {
    throw new Error('Service ID not found');
  };

  return (
    <div className='max-w-4xl mx-auto py-12 px-4 space-y-10'>
      <div className="flex items-center justify-center">
        <h1 className="md:text-4xl font-bold text-2xl">معلومات الخدمة</h1>
      </div>
      <Suspense fallback={<ServiceLoading />}>
        <ErrorBoundary fallback={<ServiceQueryError />}>
          <ServiceViewWrapper serviceId={serviceId} />
        </ErrorBoundary>
      </Suspense>
      <div>
        <Separator />
        <Suspense fallback={<LoadingReviews />}>
          <ErrorBoundary fallback={<ReviewQueryError />}>
            <Reviews serviceId={serviceId} />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  )
}

export default ServicePage