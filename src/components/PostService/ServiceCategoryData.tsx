import { Camera, Wrench, Palette, Baby, PaintBucket, BookOpenText, CookingPot, Logs } from 'lucide-react';

export const serviceCategories = [
  { icon: PaintBucket, value: 'cleaning', label: 'تنظيف' },
  { icon: Wrench, value: 'plumbing', label: 'صيانة ( كهرباء/ سباكة )' },
  { icon: Palette, value: 'graphic-design', label: 'تصميم جرافيكي' },
  { icon: Camera, value: 'photography', label: 'تصوير' },
  { icon: Baby, value: 'nanny', label: 'مجالسة أطفال' },
  { icon: BookOpenText, value: 'private-lesson', label: 'تدريس خصوصي' },
  { icon: CookingPot, value: 'cooking', label: 'طبخ' },
  { icon: Logs, value: 'other', label: 'غير ذلك' }
];
