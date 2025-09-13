import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator';
import { PublicReview } from '@/hooks/UseServiceReviews'
import { Tables } from '@/integrations/supabase/types'
import { truncateString } from '@/lib/utils';
import { StarIcon, Stars } from 'lucide-react'

interface Props {
    review: PublicReview;
}

const ReviewCard = ({
    review
}: Props) => {
    return (
        <Card className='w-96 p-4 hover:shadow-md transition-shadow cursor-pointer min-h-[250px]'>
            <CardHeader className='flex justify-between items-center flex-row'>
                <div className='flex gap-2 items-center'>
                    {
                        review?.reviewer.profile_image_url ? (
                            <Avatar className='size-7'>
                                <AvatarImage
                                    src={review.reviewer.profile_image_url}
                                />
                            </Avatar>
                        ) : (
                            <GeneratedAvatar
                                seed={review.reviewer.full_name}
                                variant="initials"
                                className="size-7"
                            />
                        )
                    }
                    <h3>{review.reviewer.full_name}</h3>
                </div>
                <div className='flex mt-2 items-center justify-start gap-2' dir='ltr'>
                    <div className='flex gap-1'>
                        {[...Array(5)].map((_, index) => (
                        <StarIcon
                            key={index} 
                            size={18}
                            fill={index < review.rating ? '#fbbf24' : 'none'}
                            stroke={index < review.rating ? '#fbbf24' : '#d1d5db'}
                        />
                    ))}
                    </div>
                    <span className='text-muted-foreground opacity-60'>{review.rating}/5</span>
                </div>
            </CardHeader>
            <Separator />
            <CardContent className='pt-4'>
                <p className='text-sm text-muted-foreground text-start'>
                    {truncateString(review.review_body, 200)}
                </p>
            </CardContent>
        </Card>
    )
}

export default ReviewCard