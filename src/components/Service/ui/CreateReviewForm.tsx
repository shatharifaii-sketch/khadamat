import { Button } from '@/components/ui/button';
import { DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useServiceReviews } from '@/hooks/UseServiceReviews'
import { StarIcon } from 'lucide-react';
import { useState } from 'react'

interface Props {
    serviceId: string;
    closeForm: () => void
}

const CreateReviewForm = ({ serviceId, closeForm }: Props) => {
    const { createReview, createReviewLoading } = useServiceReviews(serviceId);
    const [formData, setFormData] = useState({
        review_body: '',
        rating: 0
    })

    const handleSubmit = () => {
        console.log(formData);
        createReview.mutate(formData, {
            onSuccess: () => {
                closeForm();
            }
        });
    }


    return (
        <>
            <DialogTitle className='text-center text-xl'>
                انشر تقييمك للخدمة
            </DialogTitle>
            <Separator />
            <DialogDescription className='mt-4 flex flex-col gap-6'>
                    <div className='flex w-1/2 gap-5 items-center justify-between'>
                        <Label htmlFor="review_body" className='text-black'>التقييم</Label>
                        <div className='flex items-center gap-2'>
                            <div className='flex items-center'>
                                {[...Array(5)].map((_, index) => (
                                <StarIcon
                                    key={index}
                                    size={18}
                                    fill={index < formData.rating ? '#fbbf24' : 'none'}
                                    stroke={index < formData.rating ? '#fbbf24' : '#d1d5db'}
                                    onClick={() => setFormData({ ...formData, rating: index + 1 })}
                                />
                            ))}
                            </div>
                            <span className='text-muted-foreground'>{formData.rating}/5</span>
                        </div>
                    </div>
                    <div className='flex flex-col gap-3'>
                        <Label htmlFor="review_body" className='text-black'>نص التقييم</Label>
                        <Textarea
                            id="review_body"
                            value={formData.review_body}
                            onChange={(e) => setFormData({ ...formData, review_body: e.target.value })}
                            className='bg-white'
                        />
                    </div>
            </DialogDescription>
            <DialogFooter>
                <Button disabled={createReviewLoading} onClick={handleSubmit} className='flex-1'>
                    أضف التقييم
                </Button>
            </DialogFooter>
        </>
    )
}

export default CreateReviewForm