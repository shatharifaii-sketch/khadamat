import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  status: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ServiceEditModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onServiceUpdated: () => void;
}

const SERVICE_CATEGORIES = [
  'تكنولوجيا المعلومات',
  'التصميم والإبداع',
  'التسويق',
  'الترجمة',
  'الكتابة والتحرير',
  'الاستشارات',
  'التدريب والتعليم',
  'المحاسبة والمالية',
  'الخدمات القانونية',
  'أخرى'
];

const SERVICE_STATUSES = [
  { value: 'draft', label: 'مسودة', color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'published', label: 'منشور', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-800' },
  { value: 'suspended', label: 'معلق', color: 'bg-orange-100 text-orange-800' },
];

export const ServiceEditModal = ({ service, isOpen, onClose, onServiceUpdated }: ServiceEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price_range: '',
    location: '',
    phone: '',
    email: '',
    experience: '',
    status: 'draft',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        category: service.category,
        description: service.description,
        price_range: service.price_range,
        location: service.location,
        phone: service.phone,
        email: service.email,
        experience: service.experience || '',
        status: service.status,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('services')
        .update(formData)
        .eq('id', service.id);

      if (error) throw error;

      toast.success('تم تحديث الخدمة بنجاح');
      onServiceUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast.error('حدث خطأ في تحديث الخدمة');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = SERVICE_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;
    
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            تحرير الخدمة
            {getStatusBadge(service.status)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان الخدمة</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">الفئة</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_range">نطاق السعر</Label>
              <Input
                id="price_range"
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">الموقع</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">وصف الخدمة</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="experience">الخبرة (اختياري)</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">حالة الخدمة</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">معلومات إضافية</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">عدد المشاهدات:</span> {service.views}
              </div>
              <div>
                <span className="font-medium">تاريخ الإنشاء:</span> {new Date(service.created_at).toLocaleDateString('ar')}
              </div>
              <div>
                <span className="font-medium">آخر تحديث:</span> {new Date(service.updated_at).toLocaleDateString('ar')}
              </div>
              <div>
                <span className="font-medium">معرف المستخدم:</span> {service.user_id.slice(0, 8)}...
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};