import { useWebsiteAnalytics } from "@/hooks/useWebsiteAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";
import WebLineChart from "./WebLineChart";
import { useState } from "react";
import { Switch } from "../ui/switch";
import { Hash, Percent } from "lucide-react";

interface Props {
  topPaths: { path: string, count: number }[],
  visitsPerDay: { date: string, count: number }[],
  deviceStats: {
    mobile: number,
    desktop: number,
    mobilePercent: number,
    desktopPercentage: number
  } | null
}

const WebAnalytics = ({
  topPaths,
  visitsPerDay,
  deviceStats
}: Props) => {
  const [showPercent, setShowPercent] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-5">
      <Card className="">
        <CardHeader>
          <CardTitle>تحليلات الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {
              topPaths.length > 0 && (
                <div className="flex flex-col gap-2">
                  <Label>الصفحات الأكثر زيارة</Label>
                  <div>
                    {topPaths.map((path, index) => (
                      <div key={index} className={cn("px-2 py-1 rounded-md flex items-center justify-between", index % 2 === 0 ? "bg-muted" : "")}>
                        <span className="px-2">{path.path}</span>
                        <span className="px-2">{path.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>
        </CardContent>
      </Card>

      <Card className="">
          <CardHeader className="flex flex-row items-center justify-between" dir="rtl">
            <CardTitle>المنصات المستخدمة</CardTitle>
            <div className="flex items-center gap-2 flex-row-reverse">
              <Hash size={16} className={cn(!showPercent ? "text-primary" : "text-muted-foreground")} />
              <Switch checked={showPercent} onCheckedChange={setShowPercent} dir="ltr" />
              <Percent size={16} className={cn(showPercent ? "text-primary" : "text-muted-foreground")} />
            </div>
          </CardHeader>
          <CardContent>
            {
              deviceStats ? (
                <div className="flex flex-col justify-start gap-2">
                  <div className="flex justify-between items-center bg-muted px-2 py-1 rounded-md">
                    <Label>Desktop</Label>
                    <p>{showPercent ? `${deviceStats.desktopPercentage}%` : deviceStats.desktop}</p>
                  </div>
                  <div className="flex justify-between items-center px-2 py-1">
                    <Label>Mobile</Label>
                    <p>{showPercent ? `${deviceStats.mobilePercent}%` : deviceStats.mobile}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">لا يوجد بيانات</p>
              )
            }
          </CardContent>
      </Card>
    </div>
  )
}

export default WebAnalytics