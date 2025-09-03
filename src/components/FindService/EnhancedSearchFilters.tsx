import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/components/FindService/ServiceCategories';

interface EnhancedSearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onClearFilters?: () => void;
  resultsCount?: number;
  handleSearchSubmit?: () => void;
  submittedSearchTerm?: string;
  setSubmittedSearchTerm?: (term: string) => void;
}

const EnhancedSearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
  onClearFilters,
  resultsCount,
  handleSearchSubmit,
  submittedSearchTerm,
  setSubmittedSearchTerm
}: EnhancedSearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  
  const hasActiveFilters = selectedCategory !== 'all' || selectedLocation !== 'all' || submittedSearchTerm || searchTerm;
  
  const locations = [
    'رام الله', 'القدس', 'بيت لحم', 'الخليل', 'نابلس', 'جنين', 'طولكرم', 'قلقيلية', 
    'سلفيت', 'أريحا', 'طوباس', 'غزة', 'رفح', 'خان يونس', 'دير البلح'
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Main search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث عن خدمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit?.();
                  }
                }}
                className="pr-10 text-right text-lg"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm('');
                    setSubmittedSearchTerm('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="h-4 w-4 ml-2" />
              فلترة
              {hasActiveFilters && (
                <Badge variant="destructive" className="mr-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expandable filters */}
      {showFilters && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">التصنيف</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">الموقع</label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المواقع</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters?.();
                  setSubmittedSearchTerm?.('');
                }}>
                  <X className="h-4 w-4 ml-2" />
                  مسح الفلاتر
                </Button>
                {resultsCount !== undefined && (
                  <span className="text-sm text-muted-foreground">
                    {resultsCount} نتيجة
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active filters display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-2">
              <Search className="h-3 w-3" />
              {searchTerm}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  setSubmittedSearchTerm('');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              {categories.find(c => c.value === selectedCategory)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSelectedCategory('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedLocation !== 'all' && (
            <Badge variant="secondary" className="gap-2">
              <MapPin className="h-3 w-3" />
              {selectedLocation}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSelectedLocation('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchFilters;