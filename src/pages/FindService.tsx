import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Search, MapPin, Phone, Mail, Star, Copy, PhoneCall, Loader2, AlertTriangle, X, Baby, MoreHorizontal } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePublicServices } from '@/hooks/usePublicServices';
import { toast } from 'sonner';

const FindService = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showError, setShowError] = useState(true);

  const { data: services = [], isLoading, error } = usePublicServices();

  console.log('FindService render - services:', services, 'isLoading:', isLoading, 'error:', error);

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
    { icon: Baby, value: 'nanny', label: 'مربية أطفال' },
    { icon: MoreHorizontal, value: 'other', label: 'أخرى' },
  ];

  const locations = [
    'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 'سلفيت', 'أريحا', 'طوباس'
  ];

  const filteredProviders = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all-categories' || service.category === selectedCategory;
    const matchesLocation = !selectedLocation || selectedLocation === 'all-locations' || service.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleCopyPhone = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber);
    toast.success('تم نسخ رقم الهاتف');
  };

  const handleCallDirect = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmailContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = serviceCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : Camera;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = serviceCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.label : category;
  };

  return (
    <div className="min-h-screen bg-background arabic">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ابحث عن الخدمة المناسبة
          </h1>
          <p className="text-xl text-muted-foreground">
            اعثر على أفضل مقدمي الخدمات في منطقتك
          </p>
        </div>

        {/* Error Alert */}
        {error && showError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              حدث خطأ في تحميل الخدمات
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowError(false)}
                className="h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertTitle>
            <AlertDescription>
              يرجى المحاولة مرة أخرى لاحقاً أو تحديث الصفحة
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="ابحث عن خدمة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-large pr-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-large">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-categories">جميع الفئات</SelectItem>
                    {serviceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <Select onValueChange={setSelectedLocation}>
                  <SelectTrigger className="text-large">
                    <SelectValue placeholder="جميع المناطق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-locations">جميع المناطق</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2 text-large">جاري تحميل الخدمات...</span>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <div className="mb-6">
            <p className="text-large text-muted-foreground">
              تم العثور على {filteredProviders.length} نتيجة
            </p>
          </div>
        )}

        {/* Service Providers Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((service) => {
              const CategoryIcon = getCategoryIcon(service.category);
              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <CategoryIcon size={48} className="text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl-large">{service.title}</CardTitle>
                    <div className="flex items-center justify-between">
                      <p className="text-large font-semibold text-primary">
                        {service.profiles?.full_name || 'مقدم خدمة'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-large font-semibold">جديد</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={16} />
                        <span className="text-large">{service.location}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="text-large">
                          {service.price_range}
                        </Badge>
                        <Badge variant="outline" className="text-large">
                          {getCategoryLabel(service.category)}
                        </Badge>
                      </div>

                      {service.experience && (
                        <div className="text-muted-foreground text-large">
                          خبرة {service.experience}
                        </div>
                      )}

                      <div className="pt-4 space-y-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button className="w-full text-large" size="lg">
                              <Phone size={18} className="ml-2" />
                              اتصل الآن
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56">
                            <div className="space-y-2">
                              <Button
                                className="w-full justify-start"
                                variant="ghost"
                                onClick={() => handleCallDirect(service.phone)}
                              >
                                <PhoneCall size={16} className="ml-2" />
                                اتصل مباشرة
                              </Button>
                              <Button
                                className="w-full justify-start"
                                variant="ghost"
                                onClick={() => handleCopyPhone(service.phone)}
                              >
                                <Copy size={16} className="ml-2" />
                                نسخ الرقم
                              </Button>
                              <div className="px-2 py-1 text-sm text-muted-foreground">
                                {service.phone}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        <Button 
                          variant="outline" 
                          className="w-full text-large" 
                          size="lg"
                          onClick={() => handleEmailContact(service.email)}
                        >
                          <Mail size={18} className="ml-2" />
                          أرسل رسالة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && filteredProviders.length === 0 && (
          <Card className="p-12 text-center">
            <Search size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-large text-muted-foreground mb-6">
              جرب تغيير معايير البحث أو الفلاتر
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLocation('');
              }}
              variant="outline"
            >
              امسح الفلاتر
            </Button>
          </Card>
        )}

        {/* Call to Action for Service Providers */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              هل تريد أن تظهر هنا؟
            </h3>
            <p className="text-xl-large mb-6 opacity-90">
              انضم إلى مقدمي الخدمات واحصل على عملاء جدد
            </p>
            <Button size="lg" variant="secondary" className="text-xl py-6 px-8">
              انشر خدمتك الآن
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FindService;
