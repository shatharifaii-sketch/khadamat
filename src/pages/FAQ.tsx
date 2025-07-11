import Navigation from '@/components/Navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "كيف يمكنني نشر خدمة جديدة؟",
      answer: "يمكنك نشر خدمة جديدة من خلال الضغط على زر 'أنشر خدمتك' في الصفحة الرئيسية، ثم ملء النموذج بتفاصيل خدمتك."
    },
    {
      question: "هل يمكنني تعديل خدمتي بعد نشرها؟",
      answer: "نعم، يمكنك تعديل خدمتك في أي وقت من خلال لوحة التحكم الخاصة بك في صفحة الحساب."
    },
    {
      question: "كيف يمكنني التواصل مع مقدمي الخدمات؟",
      answer: "يمكنك التواصل مع مقدمي الخدمات من خلال الهاتف أو إرسال رسالة مباشرة عبر المنصة."
    },
    {
      question: "هل استخدام المنصة مجاني؟",
      answer: "نعم، التصفح والبحث عن الخدمات مجاني تماماً. رسوم الاشتراك مطلوبة فقط لنشر الخدمات."
    },
    {
      question: "كيف يمكنني البحث عن خدمة معينة؟",
      answer: "يمكنك استخدام شريط البحث أو تصفح الخدمات حسب الفئة والموقع من صفحة البحث."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل الدفع عبر البطاقات الائتمانية والحسابات البنكية المحلية."
    },
    {
      question: "كيف يمكنني الإبلاغ عن مشكلة؟",
      answer: "يمكنك التواصل معنا من خلال صفحة الاتصال أو إرسال رسالة مباشرة عبر المنصة."
    },
    {
      question: "هل يمكنني إلغاء اشتراكي؟",
      answer: "نعم، يمكنك إلغاء اشتراكك في أي وقت من خلال إعدادات الحساب."
    }
  ];

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            الأسئلة الشائعة
          </h1>
          <p className="text-xl text-muted-foreground">
            إجابات على الأسئلة الأكثر شيوعاً حول منصة خدمات
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 data-[state=open]:bg-muted/50"
            >
              <AccordionTrigger className="text-right text-lg font-medium hover:no-underline py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-right text-muted-foreground pb-6 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            لم تجد إجابة على سؤالك؟
          </p>
          <a 
            href="/contact" 
            className="text-primary hover:underline font-medium"
          >
            تواصل معنا للمساعدة
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;