
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Upload, CreditCard } from 'lucide-react';
import Navigation from '@/components/Navigation';

const PostService = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
    location: '',
    phone: '',
    email: '',
    experience: '',
  });

  const serviceCategories = [
    { icon: Camera, value: 'photography', label: 'التصوير الفوتوغرافي' },
    { icon: Music, value: 'dj', label: 'دي جي' },
    { icon: Wrench, value: 'plumbing', label: 'السباكة' },
    { icon: Truck, value: 'hauling', label: 'النقل والشحن' },
    { icon: Palette, value: 'graphic-design', label: 'التصميم الجرافيكي' },
    { icon: TrendingUp, value: 'digital-marketing', label: 'التسويق الرقمي' },
    { icon: Code, value: 'web-development', label: 'تطوير المواقع' },
    { icon: Shirt, value: 'tatreez', label: 'التطريز' },
    { icon: Printer, value: 'printing', label: 'خدمات الطباعة' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally show subscription payment modal
    alert('سيتم تحويلك لصفحة الدفع للاشتراك الشهري (10 شيكل)');
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            انشر خدمتك المهنية
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            ابدأ في كسب المال من خلال تقديم خدماتك المهنية
          </p>
          
          {/* Subscription Info */}
          <Card className="bg-primary/5 border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CreditCard className="text-primary" size={24} />
                <span className="text-xl font-semibold text-primary">اشتراك شهري: 10 شيكل فقط</span>
              </div>
              <p className="text-muted-foreground text-large">
                يشمل الاشتراك: نشر خدمات غير محدودة، تواصل مباشر مع العملاء، وإظهار متقدم في نتائج البحث
              </p>
            </CardContent>
          </Card>
        </div>

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
                <Button type="submit" size="lg" className="w-full text-xl py-6">
                  انشر الخدمة والاشتراك (10 شيكل/شهر)
                </Button>
                <p className="text-center text-muted-foreground mt-4 text-large">
                  ستحصل على 7 أيام تجربة مجانية
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostService;
