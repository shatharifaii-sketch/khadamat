import { useState } from 'react'
import ReviewCard from './ReviewCard'
import { useServiceReviews } from '@/hooks/UseServiceReviews';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ReviewDialog from './ReviewDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateReviewForm from './CreateReviewForm';

interface Props {
    serviceId: string;
}

const Reviews = ({
    serviceId
}: Props) => {
    const { reviews, userAllowed } = useServiceReviews(serviceId);
    const [creatingReview, setCreatingReview] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <div>
        <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold mb-4'>التقييمات والمراجعات</h2>

            <Dialog open={creatingReview} onOpenChange={setCreatingReview}>
                <DialogTrigger disabled={!userAllowed}  className='text-primary flex items-center gap-2'>
                    اضافة تقييم <Plus />
                </DialogTrigger>
                <DialogContent>
                    <CreateReviewForm closeForm={() => setCreatingReview(false)} serviceId={serviceId} />
                </DialogContent>
            </Dialog>
        </div>
        <div className='flex flex-col gap-1 md:gap-4 items-start md:items-center justify-start md:overflow-x-auto overflow-y-auto pb-3 max-h-[400px]'>
            {reviews.length === 0 && (
                <p className='text-muted-foreground/70 text-center mx-auto'>لا توجد تقييمات بعد. كن أول من يضيف تقييمًا!</p>
            )}
            {reviews.map((review) => (
            <Dialog key={review.id}>
                <DialogTrigger className='w-full'>
                    <ReviewCard review={review} />
                </DialogTrigger>
                <DialogContent>
                    <ReviewDialog closeDialog={() => setDialogOpen(false)} review={review} />
                </DialogContent>
            </Dialog>
        ))}
        </div>
    </div>
  )
}

export default Reviews