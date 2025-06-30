
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

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
        <div className="flex flex-wrap justify-center gap-6 text-large">
          <Link to="/about" className="text-muted-foreground hover:text-primary">من نحن</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-primary">تواصل معنا</Link>
          <Link to="/account" className="text-muted-foreground hover:text-primary">حسابي</Link>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-muted-foreground">
          © 2024 خدمات. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
