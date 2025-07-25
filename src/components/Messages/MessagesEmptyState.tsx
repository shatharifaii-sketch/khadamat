import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Search, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MessagesEmptyState = () => {
  return (
    <Card className="text-center p-8 border-dashed border-2 border-muted">
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <MessageCircle size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">لا توجد محادثات</h2>
            <p className="text-muted-foreground text-lg">
              لم تبدأ أي محادثات بعد. ابحث عن خدمة أو انتظر استفسارات العملاء!
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/find-service">
            <Button size="lg" className="w-full group">
              <Search className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              ابحث عن خدمة
              <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/post-service">
            <Button variant="outline" size="lg" className="w-full group">
              <PlusCircle className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              أضف خدمة
              <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesEmptyState;