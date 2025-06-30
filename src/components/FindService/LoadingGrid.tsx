
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LoadingGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingGrid;
