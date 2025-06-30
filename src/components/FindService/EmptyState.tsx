
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Search size={64} className="mx-auto text-muted-foreground mb-4" />
      <h3 className="text-2xl font-semibold mb-2">لا توجد نتائج</h3>
      <p className="text-muted-foreground mb-4">
        لم نجد أي خدمات تطابق البحث الحالي
      </p>
      <Button variant="outline" onClick={onClearFilters}>
        <X className="ml-2 h-4 w-4" />
        مسح الفلاتر
      </Button>
    </div>
  );
};

export default EmptyState;
