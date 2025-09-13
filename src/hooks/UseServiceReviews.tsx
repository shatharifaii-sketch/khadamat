import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client"
import { Tables } from "@/integrations/supabase/types";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { isAdmin } from "./useAdminFunctionality";

type Review = Tables<'service_reviews'>;

export interface PublicReview extends Review {
    reviewer: {
        id: string;
        full_name: string;
        profile_image_url: string;
    };
    service: {
        id: string;
        title: string;
    }
}

export const useServiceReviews = (serviceId: string) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const admin = isAdmin();
    const { data: userAllowed } = useQuery({
        queryKey: ['number-of-user-reviews'],
        queryFn: async () => {
            const { data: reviews, error } = await supabase
                .from('service_reviews')
                .select('*')
                .eq('user_id', user.id)
                .eq('service_id', serviceId)
            
                if (error) {
                    throw new Error(error.message);
                }

                return {
                    allowed: (reviews?.length ?? 0) === 0 || admin,
                    reviews
                };
        }
    })

    const { data: reviews } = useSuspenseQuery({
        queryKey: ['service-reviews'],
        queryFn: async () => {
            const { data: reviews, error } = await supabase
                .from('service_reviews')
                .select(`
                    *,
                    reviewer:service_reviews_user_id_fkey (
                        id,
                        full_name,
                        profile_image_url
                    ),
                    service:service_reviews_service_id_fkey (
                    id,
                    title
                    )
                `)
                .eq('service_id', serviceId);

            if (error || !reviews) {
                console.error('Error fetching reviews:', error);
                return [];
            }

            return reviews as PublicReview[];
        }
    });

    const createReview = useMutation({
        mutationFn: async (formData: { review_body: string, rating: number }) => {
            if (!userAllowed.allowed) {
                console.log('User not allowed to review');
                throw new Error('You already reviewed this Service | لقد قمت بتقييم هذه الخدمة من قبل')
            }

            const { data: createdReview, error } = await supabase
                .from('service_reviews')
                .insert({
                    ...formData,
                    service_id: serviceId,
                    user_id: user?.id
                })
                .single();

            if (error) {
                console.error('Error creating review:', error);
                throw new Error(error.message);
            }

            return createdReview;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-reviews'] });
            queryClient.invalidateQueries({ queryKey: ['number-of-user-reviews']})
        }
    })

    const updateReview = useMutation({
        mutationFn: async (formData: { review_id: string, review_body: string, rating: number }) => {
            if (userAllowed.reviews?.map(r => r.id).indexOf(formData.review_id) === -1 || admin) {
                console.log('User not allowed to update this review');
                throw new Error('You are not allowed to update this review');
            }

            const { data: updatedReview, error } = await supabase
                .from('service_reviews')
                .update({
                    review_body: formData.review_body,
                    rating: formData.rating
                })
                .eq('id', formData.review_id)
                .eq('user_id', user?.id)
                .select(`
                    *,
                    reviewer:service_reviews_user_id_fkey (
                        id,
                        full_name,
                        profile_image_url
                    ),
                    service:service_reviews_service_id_fkey (
                    id,
                    title
                    )`)
                .single();

            if (error) {
                throw new Error(error.message)
            }

            return updatedReview
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service_reviews'] })
        }
    })

    const deleteReview = useMutation({
        mutationFn: async (reviewId: string) => {
            if (userAllowed.reviews?.map(r => r.id).indexOf(reviewId) === -1 || admin) {
                console.log('User not allowed to delete this review');
                throw new Error('You are not allowed to delete this review');
            }

            const { error } = await supabase
                .from('service_reviews')
                .delete()
                .eq('id', reviewId)
            
            if (error) {
                throw new Error(error.message);
            }

            return;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-reviews']})
            queryClient.invalidateQueries({ queryKey: ['number-of-user-reviews']})
        }
    })

    return {
        reviews,
        createReview,
        updateReview,
        updatedReview: updateReview.data,
        userAllowed: userAllowed?.allowed,
        deleteReview,
        createReviewLoading: createReview.isPending,
        updateReviewLoading: updateReview.isPending,
        deleteReviewLoading: deleteReview.isPending
    }
}