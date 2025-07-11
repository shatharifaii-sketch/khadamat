
import { Link } from 'react-router-dom';
import { Home, Facebook, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Home size={24} />
          </div>
          <span className="text-2xl font-bold text-primary">خدمات</span>
        </div>
        <p className="text-muted-foreground text-large mb-6">
          منصتك للخدمات المهنية في فلسطين
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-large mb-6">
          <Link to="/about" className="text-muted-foreground hover:text-primary">من نحن</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-primary">تواصل معنا</Link>
          <Link to="/faq" className="text-muted-foreground hover:text-primary">الأسئلة الشائعة</Link>
        </div>
        <div className="flex justify-center gap-4 mb-6">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={24} />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={24} />
          </a>
        </div>
        <div className="pt-6 border-t border-border text-muted-foreground">
          © 2024 خدمات. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
