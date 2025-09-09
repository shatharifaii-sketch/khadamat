import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import ServiceForm from './ui/ServiceForm';
import { NavLink } from 'react-router-dom';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SelectLabel } from '@radix-ui/react-select';

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  price_range: string;
  location: string;
  phone: string;
  email: string;
  experience?: string;
  views: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  publisher: {
    full_name: string;
  };
  service_images: {
    id: string;
    image_name: string;
    image_url: string;
  }[]
}

export interface UserProfile {
  id: string;
  full_name: string;
  is_service_provider: boolean;
}

interface ServiceManagementProps {
  services: Service[];
  users: UserProfile[];
  onServiceUpdated: () => void;
}

type SortOption = "name-ar" | "name-en" | "date-asc" | "date-desc";

export const ServiceManagement = ({ services, users, onServiceUpdated }: ServiceManagementProps) => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const { deleteService } = useAdminFunctionality();

  const serviceProviders = users.filter(user => user.is_service_provider);

  const sortedServices = useMemo(() => {
    if (!services) return [];
    return [...services].sort((a, b) => {
      if (sortOption === "date-desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOption === "name-ar") {
        return a.title.localeCompare(b.title, 'ar', { sensitivity: 'base' });
      } else if (sortOption === "name-en") {
        return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
      } else if (sortOption === "date-asc") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });
  }, [services, sortOption]);

  const handleDeleteService = async (serviceId: string) => {
    try {
      deleteService.mutate(serviceId);

      toast({
        title: "تم الحذف",
        description: "تم حذف الخدمة بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الخدمة",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-col gap-3'>
        <div className="flex items-center justify-between">
          <CardTitle>إدارة الخدمات</CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إنشاء خدمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إنشاء خدمة جديدة</DialogTitle>
              </DialogHeader>
              <ServiceForm serviceProviders={serviceProviders} closeForm={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder="ترتيب حسب التاريخ" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className='text-right px-3 text-muted-foreground'>ترتيب حسب</SelectLabel>
              <SelectItem value="date-desc">الأحدث</SelectItem>
              <SelectItem value="date-asc">الأقدم</SelectItem>
              <SelectItem value="name-ar">الاسم عربي</SelectItem> <SelectItem value="name-en">الاسم الانجليزي</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-end'>العنوان</TableHead>
              <TableHead className='text-end'>الفئة</TableHead>
              <TableHead className='text-end'>مقدم الخدمة</TableHead>
              <TableHead className='text-end'>المشاهدات</TableHead>
              <TableHead className='text-end'>الحالة</TableHead>
              <TableHead className='text-end'>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {service.title}
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.publisher?.full_name || 'غير محدد'}</TableCell>
                <TableCell>{service.views}</TableCell>
                <TableCell>
                  <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>
                    {service.status === 'published' ? 'منشور' : service.status === 'draft' ? 'مسودة' : 'معطل'}
                  </Badge>
                </TableCell>
                <TableCell className='flex justify-center'>
                  <div className="flex gap-2">
                    <Button variant='link' size='sm' className='outline-primary outline outline-1'>
                      <NavLink to={`/find-service/${service.id}`}>
                        <Eye className="size-4" />
                      </NavLink>
                    </Button>
                    <Dialog open={editingService?.id === service.id} onOpenChange={(open) => !open && setEditingService(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setEditingService(service)}>
                          <Edit className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>تحرير الخدمة</DialogTitle>
                        </DialogHeader>
                        <ServiceForm isEdit={true} serviceProviders={serviceProviders} service={editingService} closeForm={() => setEditingService(null)} />
                      </DialogContent>
                    </Dialog>


                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف الخدمة "{service.title}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteService(service.id)} className="bg-destructive text-destructive-foreground">
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};