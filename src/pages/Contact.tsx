
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Mail, Phone, MapPin, Clock, Send, MailCheck } from 'lucide-react';
import { useEmail } from '@/hooks/useEmail';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation("contact");
  const lang = localStorage.getItem("language") || "en";

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [openEmailDialog, setOpenEmailDialog] = useState(false);

  const { sendContactEmail } = useEmail();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await sendContactEmail.mutateAsync(formData);
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      content: 'info@khedmatak.ps',
      description: 'راسلنا في أي وقت'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      content: '02-2345678',
      description: 'اتصل بنا للدعم الفوري'
    },
    {
      icon: MapPin,
      title: 'العنوان',
      content: 'رام الله، فلسطين',
      description: 'مكتبنا الرئيسي'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      content: 'الأحد - الخميس: 9:00 - 17:00',
      description: 'نحن في خدمتك'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'استفسار عام' },
    { value: 'technical', label: 'مشكلة تقنية' },
    { value: 'service', label: 'مشكلة في الخدمة' },
    { value: 'partnership', label: 'شراكة أو تعاون' },
    { value: 'feedback', label: 'اقتراح أو ملاحظة' }
  ];

  useEffect(() => {
    if (sendContactEmail.isSuccess) {
        setOpenEmailDialog(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: ''
        });

        toast.success(t("email_sent_successfully_toast"));
      }
  }, [sendContactEmail.isSuccess, sendContactEmail.mutateAsync, t]);


  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Contact Information */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-2xl text-start">{t("contact_info")}</CardTitle>
              <CardDescription className="text-large text-start">
                {t("contact_info_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-large mb-1 text-start">{t(info.title)}</h3>
                      <p className="text-foreground font-medium mb-1 text-start">{t(info.content)}</p>
                      <p className="text-muted-foreground text-start">{t(info.description)}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card dir={lang === "ar" ? "rtl" : "ltr"}>
            <CardHeader>
              <CardTitle className="text-2xl">{t("send_us_a_message")}</CardTitle>
              <CardDescription className="text-large">
                {t("send_a_message_description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 text-start">
                {/* Personal Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-large font-semibold">{t("full_name")} *</Label>
                    <Input
                      id="name"
                      placeholder={t("your_full_name")}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-large"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-large font-semibold">{t("email")} *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="info@khedemtak.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="text-large"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 text-start">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-large font-semibold">{t("phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0599123456"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="text-large"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inquiry-type" className="text-large font-semibold">{t("message_type")} *</Label>
                    <Select onValueChange={(value) => handleInputChange('inquiryType', value)} required>
                      <SelectTrigger className="text-large">
                        <SelectValue placeholder={t("choose")} />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(type.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-large font-semibold">{t("subject")} *</Label>
                  <Input
                    id="subject"
                    placeholder={t("message_subject")}
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="text-large"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-large font-semibold">{t("message")} *</Label>
                  <Textarea
                    id="message"
                    placeholder={t("write_message")}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="text-large min-h-32"
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full text-xl py-6" disabled={sendContactEmail.isPending}>
                  <Send size={20} className="ml-2" />
                  {sendContactEmail.isPending ? t("sending") : t("send")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Response Promise */}
      <Card className="mt-12 bg-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-primary mb-4">
            {t("quick_response_promise")}
          </h3>
          <p className="text-xl-large text-muted-foreground mb-6">
            {t("quick_response_promise_description")}
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {t("urgent_response_time")}
              </div>
              <div className="text-large text-muted-foreground">
                {t("urgent_response")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {t("general_inquiry_time")}
              </div>
              <div className="text-large text-muted-foreground">
                {t("general_inquiry")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {t("collaboration_requests")}
              </div>
              <div className="text-large text-muted-foreground">
                {t("collaboration_requests")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={openEmailDialog} onOpenChange={setOpenEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <p className='flex gap-2 items-center'>
            {t("dialog.message")}!
            <MailCheck size={16} />
          </p>
          <DialogFooter>
            <Button onClick={() => setOpenEmailDialog(false)}>{t("dialog.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;
