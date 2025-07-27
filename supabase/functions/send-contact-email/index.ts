import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Contact form submission received');
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, message }: ContactEmailRequest = await req.json();
    console.log('Processing contact form for:', email);

    // Send email directly to info@khedemtak.com
    const adminEmailResponse = await resend.emails.send({
      from: "خدماتي Contact Form <onboarding@resend.dev>",
      to: ["info@khedemtak.com"],
      subject: `رسالة جديدة من ${name}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            رسالة جديدة من موقع خدماتي
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">تفاصيل المرسل:</h3>
            <p><strong>الاسم:</strong> ${name}</p>
            <p><strong>البريد الإلكتروني:</strong> ${email}</p>
            ${phone ? `<p><strong>رقم الهاتف:</strong> ${phone}</p>` : ''}
            <p><strong>تاريخ الإرسال:</strong> ${new Date().toLocaleString('ar-SA')}</p>
          </div>

          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">الرسالة:</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0; color: #1565c0; font-size: 14px;">
              يمكنك الرد على هذه الرسالة مباشرة على البريد الإلكتروني: ${email}
            </p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "خدماتي <onboarding@resend.dev>",
      to: [email],
      subject: "شكراً لتواصلكم معنا - خدماتي",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff; text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            خدماتي
          </h2>
          
          <div style="padding: 20px;">
            <h3 style="color: #333;">عزيزي ${name}،</h3>
            
            <p style="line-height: 1.6; color: #555;">
              شكراً لتواصلكم معنا! تم استلام رسالتكم بنجاح وسنقوم بالرد عليكم في أقرب وقت ممكن.
            </p>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #495057; margin-top: 0;">ملخص رسالتكم:</h4>
              <p style="margin: 5px 0;"><strong>الموضوع:</strong> استفسار عام</p>
              <p style="margin: 5px 0;"><strong>تاريخ الإرسال:</strong> ${new Date().toLocaleString('ar-SA')}</p>
            </div>

            <p style="line-height: 1.6; color: #555;">
              نقدر اهتمامكم بخدماتنا ونتطلع للتواصل معكم قريباً.
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #007bff; font-weight: bold;">فريق خدماتي</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Emails sent successfully - Admin:", adminEmailResponse.id, "User:", userEmailResponse.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "تم إرسال رسالتك بنجاح"
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "حدث خطأ أثناء إرسال الرسالة" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);