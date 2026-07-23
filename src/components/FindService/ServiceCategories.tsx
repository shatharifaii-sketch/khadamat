
import { Camera, Wrench, Palette, Baby, Logs, PaintBucket, BookOpenText, Languages } from 'lucide-react';

export const categories = [
  { icon: PaintBucket, value: 'cleaning', label: 'تنظيف' },
  { icon: Wrench, value: 'plumbing', label: 'صيانة ( كهرباء/ سباكة )' },
  { icon: Palette, value: 'graphic-design', label: 'تصميم جرافيكي' },
  { icon: Camera, value: 'photography', label: 'تصوير' },
  { icon: Baby, value: 'nanny', label: 'مجالسة أطفال' },
  { icon: BookOpenText, value: 'private-lesson', label: 'تدريس خصوصي' },
  { icon: Languages, value: 'translating', label: 'ترجمة' },
  { icon: Logs, value: 'other', label: 'غير ذلك' }
];  

export const locations = [
  'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'أريحا', 'طولكرم', 'قلقيلية', 'سلفيت', 
  'جنين', 'طوباس', 'القدس', 'غزة', 'خان يونس', 'رفح', 'دير البلح', 'الشمال', 'الوسطى'
];
