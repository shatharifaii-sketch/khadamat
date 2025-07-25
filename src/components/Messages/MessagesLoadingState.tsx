import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const MessagesLoadingState = () => {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 text-right space-y-2">
                <div className="flex justify-end">
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-3/4 ml-auto" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-1/2 ml-auto" />
                  <Skeleton className="h-4 w-1/3 ml-auto" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default MessagesLoadingState;