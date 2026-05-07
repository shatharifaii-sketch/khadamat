import { useAdminAnalytics } from '@/hooks/useAdminAnalytics'
import { Separator } from '../ui/separator'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export interface ActivityChartProps {
    year?: number;
    day?: string;
    month?: string;
    user_count: number;
}

export interface StatProps {
    dailyStats: {
        day: string;
        user_count: number;
    }[];
    monthlyStats: {
        month: string;
        user_count: number;
    }[];
    yearlyStats: {
        year: string;
        user_count: number;
    }[];
}
const WebLineChart = ({ dailyStats, monthlyStats, yearlyStats }: StatProps) => {
    const formattedDailyStats = dailyStats?.map(d => ({
        ...d,
        day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    const formattedMonthlyStats = monthlyStats?.map(m => ({
        ...m,
        month: new Date(m.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }));

    const formattedYearlyStats = yearlyStats?.map(y => ({
        ...y,
        year: new Date(y.year).getFullYear()
    }));

    const [chartStats, setChartStats] = useState<ActivityChartProps[]>(formattedDailyStats);
    const [dataKey, setDataKey] = useState<string>('day');

    const handleChartStatsChange = (stats: ActivityChartProps[], key: string) => {
        setChartStats(stats);
        setDataKey(key);
    }

    return (
        <Card className='mb-5'>
            <CardHeader>
                <CardTitle>تحليل نشاط الموقع</CardTitle>
                <CardDescription>
                    نشاط استخدام الموقع من زيارات جديدة خلال فترة معينة
                </CardDescription>
            </CardHeader>
            <CardContent className='w-full px-2 h-[400px] flex flex-col md:flex-row gap-5'>
                <div className='flex flex-col md:flex-row gap-5'>
                    <ul className='grid grid-cols-3 md:flex md:flex-col gap-2 w-full justify-around md:justify-start'>
                        <li>
                            <Button variant={dataKey === 'day' ? 'default' : 'outline'} className='w-full' onClick={() => handleChartStatsChange(formattedDailyStats, 'day')}>
                                Daily
                            </Button>
                        </li>
                        <li>
                            <Button variant={dataKey === 'month' ? 'default' : 'outline'} className='w-full' onClick={() => handleChartStatsChange(formattedMonthlyStats, 'month')}>
                                Monthly
                            </Button>
                        </li>
                        <li>
                            <Button variant={dataKey === 'year' ? 'default' : 'outline'} className='w-full' onClick={() => handleChartStatsChange(formattedYearlyStats, 'year')}>
                                Yearly
                            </Button>
                        </li>
                    </ul>
                    <Separator orientation='vertical' className='hidden md:block' />
                    <Separator orientation='horizontal' className='md:hidden sm:block' />
                </div>
                <div className='w-full'>
                    <ChartContainer config={{}} className='h-full w-full'>
                        <LineChart data={chartStats} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey={dataKey} className='text-muted-foreground text-sm' />
                            <YAxis
                                allowDecimals={false}
                                tickCount={6}
                                className='text-sm'
                                tick={{ fontSize: 14, fill: '#555' }}
                                tickMargin={12}
                            />
                            <Tooltip />
                            <CartesianGrid stroke="#f3c3a2" strokeDasharray="5 5" />
                            <Line
                                type="natural"
                                dataKey="user_count"
                                stroke="#8884d8"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </LineChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}

export default WebLineChart