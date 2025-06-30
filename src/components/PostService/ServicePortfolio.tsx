
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const ServicePortfolio = () => {
  return (
    <div className="space-y-2">
      <Label className="text-large font-semibold">صور من أعمالك السابقة</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-large text-muted-foreground mb-2">اسحب الصور هنا أو اضغط للرفع</p>
        <p className="text-muted-foreground">PNG, JPG حتى 10MB</p>
        <Button variant="outline" className="mt-4" type="button">
          اختر الصور
        </Button>
      </div>
    </div>
  );
};

export default ServicePortfolio;
