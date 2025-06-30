
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { categories, locations } from './ServiceCategories';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation
}: SearchFiltersProps) => {
  return (
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
  );
};

export default SearchFilters;
