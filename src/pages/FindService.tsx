import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Search, MapPin, Phone, Mail, Star, Copy, PhoneCall, Loader2, AlertTriangle, X, Baby, MoreHorizontal } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePublicServices } from '@/hooks/usePublicServices';
import ContactOptions from '@/components/Chat/ContactOptions';
import { toast } from 'sonner';

const FindService = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const { data: services, isLoading, error } = usePublicServices();

  const categories = [
    { icon: Camera, value: 'photography', label: 'التصوير الفوتوغرافي' },
    { icon: Music, value: 'dj', label: 'دي جي' },
    { icon: Wrench, value: 'plumbing', label: 'السباكة' },
    { icon: Truck, value: 'hauling', label: 'النقل والشحن' },
    { icon: Palette, value: 'graphic-design', label: 'التصميم الجرافيكي' },
    { icon: TrendingUp, value: 'digital-marketing', label: 'التسويق الرقمي' },
    { icon: Code, value: 'web-development', label: 'تطوير المواقع' },
    { icon: Shirt, value: 'tatreez', label: 'التطريز' },
    { icon: Printer, value: 'printing', label: 'خدمات الطباعة' },
    { icon: Baby, value: 'nanny', label: 'مربية أطفال' },
    { icon: MoreHorizontal, value: 'other', label: 'أخرى' },
  ];

  const locations = [
    'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'أريحا', 'طولكرم', 'قلقيلية', 'سلفيت', 
    'جنين', 'طوباس', 'القدس', 'غزة', 'خان يونس', 'رفح', 'دير البلح', 'الشمال', 'الوسطى'
  ];

  const filteredServices = useMemo(() => {
    if (!services) return [];

    return services.filter(service => {
      const matchesSearch = searchTerm === '' || 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      const matchesLocation = selectedLocation === 'all' || 
        service.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [services, searchTerm, selectedCategory, selectedLocation]);

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background arabic">
        <Navigation />
        <div className="max-w-6xl mx-auto py-12 px-4">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>خطأ في تحميل الخدمات</AlertTitle>
            <AlertDescription>
              حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة مرة أخرى لاحقاً.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            ابحث عن الخدمة المناسبة
          </h1>
          <p className="text-xl text-muted-foreground">
            اكتشف أفضل الخدمات المهنية في منطقتك
          </p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="ابحث عن خدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المناطق</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <Search size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground mb-4">
              لم نجد أي خدمات تطابق البحث الحالي
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedLocation('all');
              }}
            >
              <X className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const CategoryIcon = categories.find(cat => cat.value === service.category)?.icon || Star;
              const providerName = service.profiles?.full_name || 'مقدم الخدمة';
              
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 text-right">{service.title}</CardTitle>
                        <CardDescription className="text-right mb-2">
                          {service.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <Badge variant="secondary" className="gap-1">
                            <CategoryIcon size={14} />
                            {categories.find(cat => cat.value === service.category)?.label || service.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                        <span>{service.location}</span>
                        <MapPin size={16} />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-medium justify-end">
                        <span>{service.price_range}</span>
                        <span>💰</span>
                      </div>

                      {service.experience && (
                        <div className="text-sm text-muted-foreground text-right">
                          <strong>الخبرة:</strong> {service.experience}
                        </div>
                      )}

                      <div className="text-sm text-muted-foreground text-right">
                        <strong>مقدم الخدمة:</strong> {providerName}
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="flex-1">
                              <Phone size={16} className="ml-2" />
                              اتصل
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2">
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-2"
                                onClick={() => window.open(`tel:${service.phone}`)}
                              >
                                <PhoneCall size={16} />
                                {service.phone}
                              </Button>
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-2"
                                onClick={() => copyToClipboard(service.phone, 'تم نسخ رقم الهاتف')}
                              >
                                <Copy size={16} />
                                نسخ الرقم
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        <ContactOptions
                          serviceId={service.id}
                          providerId={service.user_id}
                          serviceName={service.title}
                          providerName={providerName}
                          email={service.email}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindService;
