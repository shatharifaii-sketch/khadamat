
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePublicServices } from '@/hooks/usePublicServices';
import SearchFilters from '@/components/FindService/SearchFilters';
import ServiceCard from '@/components/FindService/ServiceCard';
import EmptyState from '@/components/FindService/EmptyState';
import LoadingGrid from '@/components/FindService/LoadingGrid';
import { categories } from '@/components/FindService/ServiceCategories';
import { useAnalytics } from '@/hooks/useAnalytics';

const FindService = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const { data: services, isLoading, error } = usePublicServices();
  const { trackSearch } = useAnalytics();

  // Set initial category from URL parameters
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    if (!services) return [];

    const filtered = services.filter(service => {
      // Enhanced search that includes category labels and handles bilingual search
      const matchesSearch = searchTerm === '' || (() => {
        const searchLower = searchTerm.toLowerCase();
        
        // Find category label for current service
        const categoryData = categories.find(cat => cat.value === service.category);
        const categoryLabel = categoryData?.label || '';
        
        // Search in title, description, category value, and category label
        return service.title.toLowerCase().includes(searchLower) ||
               service.description.toLowerCase().includes(searchLower) ||
               service.category.toLowerCase().includes(searchLower) ||
               categoryLabel.includes(searchTerm) || // Arabic search
               // Handle common English terms for categories
               (searchLower === 'photography' && service.category === 'photography') ||
               (searchLower === 'plumbing' && service.category === 'plumbing') ||
               (searchLower === 'marketing' && service.category === 'digital-marketing') ||
               (searchLower === 'design' && service.category === 'graphic-design') ||
               (searchLower === 'development' && service.category === 'web-development') ||
               (searchLower === 'printing' && service.category === 'printing') ||
               (searchLower === 'nanny' && service.category === 'nanny') ||
               (searchLower === 'dj' && service.category === 'dj') ||
               (searchLower === 'hauling' && service.category === 'hauling');
      })();
      
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      const matchesLocation = selectedLocation === 'all' || 
        service.location.toLowerCase().includes(selectedLocation.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation;
    });

    // Track search if there's a search term
    if (searchTerm.trim()) {
      trackSearch.mutate({
        query: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
        resultsCount: filtered.length,
      });
    }

    return filtered;
  }, [services, searchTerm, selectedCategory, selectedLocation, trackSearch]);

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
