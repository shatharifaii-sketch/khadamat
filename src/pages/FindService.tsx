
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Camera, Music, Wrench, Truck, Palette, TrendingUp, Code, Shirt, Printer, Search, MapPin, Phone, Mail, Star } from 'lucide-react';
import Navigation from '@/components/Navigation';

const FindService = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

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

  const locations = [
    'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 'سلفيت', 'أريحا', 'طوباس'
  ];

  // Sample service providers (in real app, this would come from backend)
  const serviceProviders = [
    {
      id: 1,
      name: 'أحمد محمد',
      service: 'تصوير الأفراح والمناسبات',
      category: 'photography',
      location: 'رام الله',
      price: '300-600 شيكل',
      rating: 4.8,
      reviews: 45,
      phone: '0599123456',
      email: 'ahmed@example.com',
      experience: '7 سنوات',
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'فاطمة أحمد',
      service: 'تصميم جرافيكي وهوية بصرية',
      category: 'graphic-design',
      location: 'نابلس',
      price: '150-400 شيكل',
      rating: 4.9,
      reviews: 67,
      phone: '0598765432',
      email: 'fatima@example.com',
      experience: '5 سنوات',
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'خالد سالم',
      service: 'سباكة وصيانة منزلية',
      category: 'plumbing',
      location: 'الخليل',
      price: '80-200 شيكل',
      rating: 4.7,
      reviews: 89,
      phone: '0597654321',
      email: 'khaled@example.com',
      experience: '10 سنوات',
      image: '/api/placeholder/300/200'
    },
  ];

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = provider.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || provider.category === selectedCategory;
    const matchesLocation = !selectedLocation || provider.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

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
                    <SelectItem value="">جميع الفئات</SelectItem>
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
                    <SelectItem value="">جميع المناطق</SelectItem>
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

        {/* Results */}
        <div className="mb-6">
          <p className="text-large text-muted-foreground">
            تم العثور على {filteredProviders.length} نتيجة
          </p>
        </div>

        {/* Service Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  <Camera size={48} className="text-muted-foreground" />
                </div>
                <CardTitle className="text-xl-large">{provider.service}</CardTitle>
                <div className="flex items-center justify-between">
                  <p className="text-large font-semibold text-primary">{provider.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-large font-semibold">{provider.rating}</span>
                    <span className="text-muted-foreground">({provider.reviews})</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} />
                    <span className="text-large">{provider.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-large">
                      {provider.price}
                    </Badge>
                    <span className="text-muted-foreground text-large">
                      خبرة {provider.experience}
                    </span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button className="w-full text-large" size="lg">
                      <Phone size={18} className="ml-2" />
                      اتصل الآن
                    </Button>
                    <Button variant="outline" className="w-full text-large" size="lg">
                      <Mail size={18} className="ml-2" />
                      أرسل رسالة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProviders.length === 0 && (
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
