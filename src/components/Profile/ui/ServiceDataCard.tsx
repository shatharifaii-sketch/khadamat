import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useServiceAnalytics } from '@/hooks/useServiceAnalytics'
import { Tables } from '@/integrations/supabase/types'
import { truncateString } from '@/lib/utils'
import { Eye, TrendingUp } from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

interface Props {
    service: Tables<'services'>
}

const ServiceDataCard = ({
    service
}: Props) => {

    const { data: analyticsData, isLoading: analyticsLoading } = useServiceAnalytics(service.id);

    const isNewlyPublished = () => {
        const now = new Date();
        const serviceDate = new Date(service.created_at);
        const timeDiff = now.getTime() - serviceDate.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        return hoursDiff <= 48 && service.status === 'published';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                            <NavLink to={`/find-service/${service.id}`}>
                                {service.title}
                            </NavLink>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {truncateString(service.description, 50)}
                        </p>
                        <div className='flex gap-2 items-center justify-start'>
                            {isNewlyPublished && (
                            <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground animate-pulse">
                                جديد!
                            </Badge>
                        )}

                        {/* Enhanced analytics display */}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>
                                    {analyticsLoading ? '...' : (analyticsData?.totalViews || service.views)} مشاهدة
                                </span>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}

export default ServiceDataCard