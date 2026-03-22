import { supabase } from "@/integrations/supabase/client"
import { useMutation } from "@tanstack/react-query"

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

export const useEmail = () => {
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

    return {
        sendContactEmail,
        sendReportEmail
    }
}