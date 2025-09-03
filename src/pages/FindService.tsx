
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { usePublicServices } from '@/hooks/usePublicServices';
import EnhancedSearchFilters from '@/components/FindService/EnhancedSearchFilters';
import EnhancedServiceCard from '@/components/FindService/EnhancedServiceCard';
import EmptyState from '@/components/FindService/EmptyState';
import LoadingGrid from '@/components/FindService/LoadingGrid';
import { categories } from '@/components/FindService/ServiceCategories';
import { useAnalytics } from '@/hooks/useAnalytics';

const FindService = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  const { data: services, isLoading, error } = usePublicServices();
  const { trackSearch } = useAnalytics();

  const handleSearchSubmit = () => {
    console.log('submitting')
    setSubmittedSearchTerm(searchTerm);

    trackSearch.mutate({
      query: searchTerm,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      location: selectedLocation !== 'all' ? selectedLocation : undefined,
      resultsCount: filteredServices.length, // number of matches
    });
  }

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

    return filtered;
  }, [services, selectedCategory, selectedLocation, submittedSearchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setSubmittedSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>خطأ في تحميل الخدمات</AlertTitle>
          <AlertDescription>
            حدث خطأ أثناء تحميل الخدمات. يرجى المحاولة مرة أخرى لاحقاً.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
          ابحث عن الخدمة المناسبة
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          اكتشف أفضل الخدمات المهنية في منطقتك واحصل على أفضل العروض
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <EnhancedSearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        onClearFilters={clearFilters}
        resultsCount={filteredServices.length}
        handleSearchSubmit={handleSearchSubmit}
        submittedSearchTerm={submittedSearchTerm}
        setSubmittedSearchTerm={setSubmittedSearchTerm}
      />

      {/* Results */}
      {isLoading ? (
        <LoadingGrid />
      ) : filteredServices.length === 0 ? (
        <EmptyState onClearFilters={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredServices.map((service) => (
            <EnhancedServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindService;
