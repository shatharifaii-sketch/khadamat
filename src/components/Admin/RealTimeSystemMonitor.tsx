import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SystemMetrics {
  activeUsers: number;
  activeConversations: number;
  messagesPerMinute: number;
  systemLoad: number;
  uptime: string;
}

const RealTimeSystemMonitor = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    activeConversations: 0,
    messagesPerMinute: 0,
    systemLoad: 0,
    uptime: '0m'
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time metrics (in a real app, this would come from your backend)
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 10 - 5)),
        activeConversations: Math.max(0, prev.activeConversations + Math.floor(Math.random() * 6 - 3)),
        messagesPerMinute: Math.max(0, Math.floor(Math.random() * 50)),
        systemLoad: Math.min(100, Math.max(0, prev.systemLoad + Math.random() * 20 - 10)),
        uptime: formatDistanceToNow(new Date(Date.now() - Math.random() * 86400000), { locale: ar })
      }));
      setLastUpdate(new Date());
      setIsConnected(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getLoadColor = (load: number) => {
    if (load < 30) return 'text-green-600';
    if (load < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLoadVariant = (load: number) => {
    if (load < 30) return 'default';
    if (load < 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            مراقب النظام المباشر
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                متصل
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="h-3 w-3 mr-1" />
                منقطع
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              آخر تحديث: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ar })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Real-time metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{metrics.activeUsers}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              مستخدمين نشطين
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.activeConversations}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MessageSquare className="h-3 w-3" />
              محادثات نشطة
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.messagesPerMinute}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              رسالة/دقيقة
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.uptime}</div>
            <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              وقت التشغيل
            </div>
          </div>
        </div>

        {/* System load */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">حمولة النظام</span>
            <Badge variant={getLoadVariant(metrics.systemLoad)} className={getLoadColor(metrics.systemLoad)}>
              {metrics.systemLoad.toFixed(1)}%
            </Badge>
          </div>
          <Progress 
            value={metrics.systemLoad} 
            className="h-2"
          />
        </div>

        {/* Performance indicators */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-green-600">99.9%</div>
            <div className="text-xs text-muted-foreground">وقت التشغيل</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-blue-600">45ms</div>
            <div className="text-xs text-muted-foreground">زمن الاستجابة</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-purple-600">2.1GB</div>
            <div className="text-xs text-muted-foreground">استخدام الذاكرة</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeSystemMonitor;