import { GeneratedAvatar } from '@/components/GeneratedAvatar';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PublicReview, useServiceReviews } from '@/hooks/UseServiceReviews'
import { DialogDescription } from '@radix-ui/react-dialog';
import { Edit, Loader2, StarIcon, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    review: PublicReview;
    closeDialog: () => void;
}

const ReviewDialog = ({
    review,
    closeDialog
}: Props) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [editing, setEditing] = useState<boolean>(false);
    const { updateReview, deleteReview, updateReviewLoading, deleteReviewLoading } = useServiceReviews(review.service.id);
    const [localReview, setLocalReview] = useState<PublicReview>(review);
    const [formData, setFormData] = useState({
        review_id: '',
        review_body: '',
        rating: 0,
    })

    useEffect(() => {
        setLocalReview(review);
    }, [review])

    useEffect(() => {
        if (editing) {
            setFormData({
                review_id: review.id,
                review_body: review.review_body,
                rating: review.rating
            })
        }
    }, [editing])

    const handleSubmitUpdatedData = () => {
        //TODO: when the data is updated, show the updated details immediately without closing the dialog
        updateReview.mutate(formData, {
            onSuccess: (newReview) => {
                setLocalReview(newReview);
                setEditing(false);
                toast({
                    title: 'تم التحديث',
                    description: 'تم تحديث التقييم بنجاح',
                });
            },
        });
        setEditing(false);
    }

    const handleDeleteReview = () => {
        //TODO: close the dialog after deletion
        deleteReview.mutate(review.id, {
            onSuccess: () => {
                closeDialog();
                toast({
                    title: 'تم الحذف',
                    description: 'تم حذف التقييم بنجاح',
                });
            },
        });
    }

    return (
        <>
            <DialogTitle className='text-lg font-bold text-start pr-10 flex items-center gap-2'>
                <span>مراجعة للخدمة</span>
                <span>{localReview.service.title}</span>
            </DialogTitle>
            <Separator />
            <DialogHeader className='flex justify-between items-center flex-row'>
                <div className='flex gap-2 items-center'>
                    {
                        localReview.reviewer.profile_image_url ? (
                            <Avatar className='size-7'>
                                <AvatarImage
                                    src={localReview.reviewer.profile_image_url}
                                />
                            </Avatar>
                        ) : (
                            <GeneratedAvatar
                                seed={localReview.reviewer.full_name}
                                variant="initials"
                                className="size-7"
                            />
                        )
                    }
                    {localReview.reviewer.full_name}
                </div>
                <div className='flex items-center justify-start gap-2' dir='ltr'>
                    {editing ? (
                        <div className='flex gap-5 items-center justify-between' dir='rtl'>
                            <Label htmlFor="review_body">التقييم</Label>
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
                    ) : (
                        <>
                            <div className='flex gap-1'>
                                {!updateReviewLoading && [...Array(5)].map((_, index) => (
                                    <StarIcon
                                        key={index}
                                        size={18}
                                        fill={index < localReview.rating ? '#fbbf24' : 'none'}
                                        stroke={index < localReview.rating ? '#fbbf24' : '#d1d5db'}
                                    />
                                ))}
                                {updateReviewLoading && <Skeleton className='h-6 w-32 rounded-full bg-muted-foreground/20' />}
                            </div>
                            <span className='text-muted-foreground opacity-60'>
                                {updateReviewLoading ? (
                                    <Loader2 className='size-4 animate-spin' />
                                ) : (
                                    `${localReview.rating}/5`
                                )}
                            </span>
                        </>
                    )}

                </div>
            </DialogHeader>
            <DialogDescription className='mt-4 text-md text-start'>
                {editing ? (
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor="review_body">نص التقييم</Label>
                            <Textarea
                            id="review_body"
                            value={formData.review_body}
                            onChange={(e) => setFormData({ ...formData, review_body: e.target.value })}
                            className='bg-white'
                        />
                    </div>
                ) : (
                    <>
                        {localReview.review_body}
                    </>
                )}
            </DialogDescription>
            <DialogFooter className='mt-4'>
                <div className='flex-1 justify-between items-center flex' dir='rtl'>
                    {user?.id === localReview.reviewer.id && (
                        <span className='text-xs text-muted-foreground mr-2'>
                            {editing ? (
                                <Button onClick={handleSubmitUpdatedData}>
                                    حفظ التغييرات
                                </Button>
                            ) : (
                                <div className='flex gap-1'>
                                    <Button onClick={() => setEditing(true)} className='outline outline-1' size='sm' variant='ghost'>
                                        <Edit className='size-4' />
                                        تعديل التقييم
                                    </Button>
                                    <Button onClick={handleDeleteReview} className='outline outline-1' size='sm' variant='destructive' disabled={deleteReviewLoading}>
                                        <Trash className='size-4' />
                                    </Button>
                                </div>
                            )}
                        </span>
                    )}
                    <span className='text-sm text-muted-foreground ml-2'>
                        {
                            new Date(localReview.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })
                        }
                    </span>
                </div>
            </DialogFooter>
        </>
    )
}

export default ReviewDialog