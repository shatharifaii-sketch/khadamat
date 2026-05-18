import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Service, useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import ServiceForm from './ui/ServiceForm';
import { NavLink } from 'react-router-dom';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { SelectLabel } from '@radix-ui/react-select';
import { toast } from 'sonner';
import { ServiceLink } from '../PostService/ServiceLinks';
import { Json } from '@/integrations/supabase/types';
import { useTranslation } from 'react-i18next';



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
  const { t } = useTranslation("admin");
  const lang = localStorage.getItem("language") || "en";

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

      toast(t("table.service_management.toasts.deleted_title"), {
        description: t("table.service_management.toasts.deleted_description"),
      });
    } catch (error: any) {
      toast.error(t("table.service_management.toasts.error_title"), {
        description: error.message || t("table.service_management.toasts.error_description"),
      });
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-col gap-3'>
        <div className="flex items-center justify-between">
          <CardTitle>{t("table.service_management.title")}</CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("table.service_management.create_service")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("table.service_management.create_service_title")}</DialogTitle>
              </DialogHeader>
              <ServiceForm serviceProviders={serviceProviders} closeForm={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder={t("table.service_management.sort_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className='text-right px-3 text-muted-foreground'>
                {t("table.service_management.sort.label")}
              </SelectLabel>
              <SelectItem value="date-desc">{t("table.service_management.sort.newest")}</SelectItem>
              <SelectItem value="date-asc">{t("table.service_management.sort.oldest")}</SelectItem>
              <SelectItem value="name-ar">{t("table.service_management.sort.name_ar")}</SelectItem> <SelectItem value="name-en">{t("table.service_management.sort.name_en")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-end'>{t("table.service_management.table.title")}</TableHead>
              <TableHead className='text-end'>{t("table.service_management.table.category")}</TableHead>
              <TableHead className='text-end'>{t("table.service_management.table.provider")}</TableHead>
              <TableHead className='text-end'>{t("table.service_management.table.views")}</TableHead>
              <TableHead className='text-end'>{t("table.service_management.table.status")}</TableHead>
              <TableHead className='text-end'>{t("table.service_management.table.actions")}</TableHead>
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
                    {service.status === 'published' ? t("table.service_management.status.published") : service.status === 'draft' ? t("table.service_management.status.draft") : t("table.service_management.status.disabled")}
                  </Badge>
                </TableCell>
                <TableCell className='flex justify-center'>
                  <div className="flex gap-2">
                    <Button variant='link' size='sm' className='outline-primary outline outline-1'>
                      <NavLink to={`/find-service/${service.id}`} className="flex items-center justify-center">
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
                          <DialogTitle>{t("table.service_management.edit_service")}</DialogTitle>
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
                          <AlertDialogTitle>{t("table.service_management.delete_dialog.title")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("table.service_management.delete_dialog.description", { title: service.title })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("table.service_management.delete_dialog.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteService(service.id)} className="bg-destructive text-destructive-foreground">
                            {t("table.service_management.delete_dialog.confirm")}
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