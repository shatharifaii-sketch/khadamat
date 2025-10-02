import { useMutation } from "@tanstack/react-query"

interface WelcomeEmail {
    name: string;
    email: string;
}

export const useEmail = () => {
    const sendWelcomeEmail = useMutation({
        mutationKey: ['send-welcome-email'],
        mutationFn: async ({name, email}: WelcomeEmail) => {
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email-dev`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                return await response.json();
            }

            return response;
        }
    });

    return {
        sendWelcomeEmail
    }
}