import Navigation from '@/components/Navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const { t } = useTranslation("faqs");
  const lang = localStorage.getItem("language") || "en";
  const faqs = t("questions", { returnObjects: true }) as {
    question: string;
    answer: string;
  }[];

  return (
      <div className="max-w-4xl mx-auto py-12 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("description")}
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
              <AccordionContent className="text-right text-muted-foreground pb-6 leading-relaxed text-start">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t("contact.question")}
          </p>
          <a 
            href="/contact" 
            className="text-primary hover:underline font-medium"
          >
            {t("contact.action")}
          </a>
        </div>
      </div>
  );
};

export default FAQ;