
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscription';
import { usePendingService } from '@/hooks/usePendingService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const PendingServiceHandler = () => {
  const { user } = useAuth();
  const { createService } = useServices();
  const { canPostService, getUserSubscription } = useSubscription();
  const { pendingService, clearPendingService } = usePendingService();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetryButton, setShowRetryButton] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');

  const handlePendingService = async (manualRetry = false) => {
    // Only proceed if user is authenticated and has pending service data
    if (!user || !pendingService) return;

    if (manualRetry) {
      setRetryCount(prev => prev + 1);
      setShowRetryButton(false);
    }

    setIsProcessing(true);
    setProcessingStatus('checking');

    try {
      // Refresh subscription data first
      await getUserSubscription.refetch();
      
      // Check if user can now post services (has subscription)
      const canPost = await canPostService();
      
      if (canPost) {
        console.log('User can post service, creating pending service...');
        setProcessingStatus('creating');
        
        await createService.mutateAsync({
          title: pendingService.title,
          category: pendingService.category,
          description: pendingService.description,
          price_range: pendingService.price,
          location: pendingService.location,
          phone: pendingService.phone,
          email: pendingService.email,
          experience: pendingService.experience
        });
        
        setProcessingStatus('success');
        
        // Clear pending service after successful creation
        clearPendingService();
        
        toast.success('تم نشر خدمتك بنجاح! مرحباً بك في المنصة', {
          duration: 5000,
          action: {
            label: 'عرض الخدمة',
            onClick: () => navigate('/account')
          }
        });
        
        // Navigate to account page to see the service after a brief delay
        setTimeout(() => {
          navigate('/account');
        }, 2000);
        
      } else {
        // Still no subscription, show status
        console.log('Subscription not yet active, waiting...');
        setProcessingStatus('idle');
        
        if (retryCount >= 3) {
          setShowRetryButton(true);
          toast.info('لم يتم تفعيل اشتراكك بعد. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.', {
            duration: 8000
          });
        }
      }
      
    } catch (error) {
      console.error('Error creating pending service:', error);
      setProcessingStatus('error');
      setShowRetryButton(true);
      
      toast.error('حدث خطأ في نشر الخدمة. يرجى المحاولة مرة أخرى', {
        action: {
          label: 'إعادة المحاولة',
          onClick: () => handlePendingService(true)
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!user || !pendingService) return;

    // Check subscription status every 3 seconds with exponential backoff
    const checkInterval = Math.min(3000 * Math.pow(1.5, retryCount), 15000);
    const timeoutId = setTimeout(() => handlePendingService(), checkInterval);
    
    return () => clearTimeout(timeoutId);
  }, [user, pendingService, retryCount]);

  // Auto-retry mechanism with exponential backoff
  useEffect(() => {
    if (processingStatus === 'error' && retryCount < 3) {
      const retryDelay = 5000 * Math.pow(2, retryCount); // 5s, 10s, 20s
      const retryTimeout = setTimeout(() => {
        handlePendingService(true);
      }, retryDelay);
      
      return () => clearTimeout(retryTimeout);
    }
  }, [processingStatus, retryCount]);

  // Render processing status for better user feedback
  if (!pendingService || !user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {processingStatus === 'checking' && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {processingStatus === 'creating' && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            {processingStatus === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {processingStatus === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            {processingStatus === 'idle' && (
              <RefreshCw className="h-5 w-5 text-blue-500" />
            )}
            
            <div className="flex-1">
              <h4 className="font-medium text-sm">
                {processingStatus === 'checking' && 'جاري التحقق من الاشتراك...'}
                {processingStatus === 'creating' && 'جاري نشر الخدمة...'}
                {processingStatus === 'success' && 'تم نشر الخدمة بنجاح!'}
                {processingStatus === 'error' && 'فشل في نشر الخدمة'}
                {processingStatus === 'idle' && 'في انتظار تفعيل الاشتراك...'}
              </h4>
              
              <p className="text-xs text-muted-foreground mt-1">
                {processingStatus === 'checking' && 'التحقق من حالة الدفع...'}
                {processingStatus === 'creating' && `نشر خدمة: ${pendingService.title}`}
                {processingStatus === 'success' && 'سيتم توجيهك إلى لوحة التحكم'}
                {processingStatus === 'error' && 'حدث خطأ، يرجى المحاولة مرة أخرى'}
                {processingStatus === 'idle' && `محاولة ${retryCount + 1}/4`}
              </p>
            </div>
          </div>
          
          {showRetryButton && (
            <Button 
              onClick={() => handlePendingService(true)}
              disabled={isProcessing}
              size="sm"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري المحاولة...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  إعادة المحاولة
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingServiceHandler;
