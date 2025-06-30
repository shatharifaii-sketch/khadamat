
import { useState, useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePublicServices } from '@/hooks/usePublicServices';
import SearchFilters from '@/components/FindService/SearchFilters';
import ServiceCard from '@/components/FindService/ServiceCard';
import EmptyState from '@/components/FindService/EmptyState';
import LoadingGrid from '@/components/FindService/LoadingGrid';

const FindService = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const { data: services, isLoading, error } = usePublicServices();

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
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
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
        />

        {/* Results */}
        {isLoading ? (
          <LoadingGrid />
        ) : filteredServices.length === 0 ? (
          <EmptyState onClearFilters={clearFilters} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindService;
