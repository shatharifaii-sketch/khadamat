import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useStripe from "@/hooks/use-stripe";
import { cn } from "@/lib/utils";
import { Home, LoaderCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { verifySession, isVerifySessionSuccess } = useStripe();
  const sessionId = searchParams.get('session_id');

  const [subscriptiondata, setSubscriptiondata] = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    const run = async () => {
      const data = await verifySession(sessionId);

      if (data) {
        setSubscriptiondata(data);
      }
    }

    run();
  }, [sessionId, verifySession]);

  if (!sessionId) {
    return <Navigate to="/" />;
  }

  if (!subscriptiondata && isVerifySessionSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <img src="/application_logo_cut.png" className='h-12' alt="cut logo" />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1 mb-3">
          <p>حدث خطأ</p>
          <p>واجهنا مشكلة في التحقق من الاشتراك!</p>
          <Link to={'/'} className="underline text-blue-400">
            الإنتقال إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Home size={24} />
          </div>
          <span className="text-2xl font-bold text-primary">خدمتك</span>
        </Link>
      </div>
      {
        subscriptiondata ? (
          <>
            <div className="flex flex-col items-center gap-1 mb-3">
              <p>اشتراكك نجح</p>
              <p>جهز حسابك و اتأكد من معلوماتك و إبدأ نشر خدماتك!</p>
              <Link to={'/'} className="underline text-blue-400">
                الإنتقال إلى الصفحة الرئيسية
              </Link>
            </div>
            <Card className={cn('col-span-1 flex flex-col justify-between', subscriptiondata.subscription_tier.class_name)}>
              <CardHeader className='text-2xl text-center font-bold'>
                {subscriptiondata?.subscription_tier.title}
                <span className='block mt-3'>
                  <Badge className={cn('flex items-center gap-2 w-fit mx-auto', subscriptiondata.subscription_tier.badge_class_name)}>
                    <Star className='text-yellow-400' />{subscriptiondata.subscription_tier.free_trial_period_text}
                  </Badge>
                </span>
                <span className='text-sm'>عدد الخدمات المتاحة: {subscriptiondata.subscription_tier.allowed_services}</span>
              </CardHeader>
              <CardContent>
                <div className='flex flex-col gap-4'>
                  <div>
                    <div className={cn('border-2 border-dashed rounded-lg p-2', subscriptiondata.subscription_tier.class_name)}>
                      <span className={cn('flex items-center gap-2', subscriptiondata.subscription_tier.class_name)}>
                        نقاط مهمة للاشتراك:
                      </span>
                      <ul className='list-disc list-inside'>
                        {(subscriptiondata.subscription_tier.notes ?? []).map((note: string) => (
                          <li className='text-start' key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>

            </Card>
          </>
        ) : (
          <>
            <LoaderCircle className="size-8 animate-spin" />
          </>
        )
      }
    </div>
  )
}

export default PaymentSuccess