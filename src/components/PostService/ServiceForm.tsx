
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { serviceCategories } from './ServiceCategoryData';

const ServiceForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createService, isCreating } = useServices();
  const { canPostService } = useSubscription();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    phone: '',
    email: user?.email || '',
    experience: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.price || !formData.location || !formData.phone) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Check if user can post more services
    if (!canPostService()) {
      // Redirect to payment page
      navigate('/payment', { 
        state: { 
          serviceData: formData,
          servicesNeeded: 2 // Default package
        } 
      });
      return;
    }

    try {
      await createService.mutateAsync({
        title: formData.title,
        category: formData.category,
        description: formData.description,
        price_range: formData.price,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        experience: formData.experience
      });
      
      // Navigate to account page to see the service
      navigate('/account');
    } catch (error) {
      console.error('Error submitting service:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">تفاصيل الخدمة</CardTitle>
        <CardDescription className="text-large">
          املأ المعلومات التالية لنشر خدمتك
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-large font-semibold">عنوان الخدمة *</Label>
            <Input
              id="title"
              placeholder="مثال: تصوير الأفراح والمناسبات"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-large"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-large font-semibold">فئة الخدمة *</Label>
            <Select onValueChange={(value) => handleInputChange('category', value)} required>
              <SelectTrigger className="text-large">
                <SelectValue placeholder="اختر فئة الخدمة" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-large font-semibold">وصف تفصيلي للخدمة *</Label>
            <Textarea
              id="description"
              placeholder="اكتب وصفاً مفصلاً عن خدمتك، خبرتك، والمميزات التي تقدمها..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="text-large min-h-32"
              required
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-large font-semibold">نطاق الأسعار *</Label>
            <Input
              id="price"
              placeholder="مثال: 200-500 شيكل"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              className="text-large"
              required
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-large font-semibold">المنطقة/المحافظة *</Label>
            <Input
              id="location"
              placeholder="مثال: رام الله، نابلس، غزة..."
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="text-large"
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-large font-semibold">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0599123456"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="text-large"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-large font-semibold">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-large"
                required
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-2">
            <Label htmlFor="experience" className="text-large font-semibold">سنوات الخبرة</Label>
            <Input
              id="experience"
              placeholder="مثال: 5 سنوات"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              className="text-large"
            />
          </div>

          {/* Portfolio Upload */}
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

          {/* Submit Button */}
          <div className="pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-xl py-6"
              disabled={isCreating}
            >
              {isCreating ? 'جاري النشر...' : 
               canPostService() ? 'انشر الخدمة' : 'ادفع وانشر الخدمة (10 شيكل)'}
            </Button>
            {!canPostService() && (
              <p className="text-center text-muted-foreground mt-4 text-large">
                سيتم توجيهك لصفحة الدفع أولاً
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceForm;
