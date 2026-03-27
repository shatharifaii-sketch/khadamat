import { supabase } from "@/integrations/supabase/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

async function sendContact(formData: {
    name: string,
    email: string,
    phone: string,
    subject: string,
    message: string,
    inquiryType: string
}) {
    const { data, error } = await supabase.functions.invoke(
        "send-contact-email",
        {
            body: JSON.stringify(formData)
        }
    )

    if (error) {
        console.log(error);
        throw error;
    }

    return data
}

async function sendReport(formData: {
    name: string,
    email: string,
    phone: string,
    report_message: string,
    object_type: string,
    object_id: string
}) {
    const { data, error } = await supabase.functions.invoke(
        "send-report-email",
        {
            body: JSON.stringify(formData)
        }
    )

    if (error) {
        console.log(error);
        throw error;
    }

    return data
}

async function sendPasswordUpdate({email}: {email: string}) {
    const { data, error } = await supabase.functions.invoke(
        "send-password-change-email",
        {
            body: JSON.stringify({ email })
        }
    )

    if (error) {
        console.log(error);
        throw error;
    }

    console.log(data);

    return data
}

export const useEmail = () => {
    const queryClient = useQueryClient();

    const sendContactEmail = useMutation({
        mutationKey: ['send-contact-email'],
        mutationFn: sendContact,
        retry: false
    })

    const sendReportEmail = useMutation({
        mutationKey: ['send-report-email'],
        mutationFn: sendReport,
        retry: false
    })

    const sendEmailUpdateEmail = useMutation({
    mutationFn: async ({ oldEmail, newEmail, name }: { oldEmail: string; newEmail: string; name: string; }) => {
      const response = await supabase.functions.invoke('send-email-update-email', { body: JSON.stringify({ 
        oldEmail, 
        newEmail,
        name
      }) });

      if (!response.data.success) {
        console.error('Error verifying OTP:', response.data.error);
        return { error: response.data.error };
      }
      
      toast.success('أرسلنا لك رابط التحقق');

      return response.data.success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast.error('حدث خطأ في تحديث الملف الشخصي');
    }
  });

    const sendPasswordUpdateEmail = useMutation({
        mutationKey: ['send-password-update-email'],
        mutationFn: sendPasswordUpdate,
        retry: false
    })

    return {
        sendContactEmail,
        sendReportEmail,
        sendEmailUpdateEmail,
        sendPasswordUpdateEmail
    }
}