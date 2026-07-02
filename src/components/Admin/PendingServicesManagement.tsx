import { Service, useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { NavLink } from 'react-router-dom';
import ServiceForm from './ui/ServiceForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import PendingServiceData from './ui/PendingServiceData';
import { useTranslation } from 'react-i18next';

interface Props {
  services: Service[];
  onServiceUpdated: () => void
}

type SortOption = "name-ar" | "name-en" | "date-asc" | "date-desc";

const PendingServicesManagement = ({ services }: Props) => {
  const { t } = useTranslation("admin");
  const lang = localStorage.getItem("language") || "en";

  const [serviceToAccept, setServiceToAccept] = useState<Service | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');

  const { deleteService } = useAdminFunctionality();

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

      toast(t("table.pending_services_management.toasts.deleted_title"), {
        description: t("table.pending_services_management.toasts.deleted_description"),
      });
    } catch (error: any) {
      toast.error(t("table.pending_services_management.toasts.error_title"), {
        description: error.message || t("table.pending_services_management.toasts.error_description"),
      });
    }
  };

  return (
    <Card>
      <CardHeader className='flex flex-col gap-3'>
        <div className="flex items-center justify-between">
          <CardTitle>{t("table.pending_services_management.title")}</CardTitle>
        </div>
        <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
          <SelectTrigger>
            <SelectValue placeholder={t("table.pending_services_management.sort_placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className='text-right px-3 text-muted-foreground'>
                {t("table.pending_services_management.sort.label")}
              </SelectLabel>
              <SelectItem value="date-desc">{t("table.pending_services_management.sort.newest")}</SelectItem>
              <SelectItem value="date-asc">{t("table.pending_services_management.sort.oldest")}</SelectItem>
              <SelectItem value="name-ar">{t("table.pending_services_management.sort.name_ar")}</SelectItem>
              <SelectItem value="name-en">{t("table.pending_services_management.sort.name_en")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='text-end'>{t("table.pending_services_management.table.title")}</TableHead>
              <TableHead className='text-end'>{t("table.pending_services_management.table.category")}</TableHead>
              <TableHead className='text-end'>{t("table.pending_services_management.table.provider")}</TableHead>
              <TableHead className='text-end'>{t("table.pending_services_management.table.views")}</TableHead>
              <TableHead className='text-end'>{t("table.pending_services_management.table.status")}</TableHead>
              <TableHead className='text-end'>{t("table.pending_services_management.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedServices.length > 0 ? (sortedServices.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {service.title}
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.publisher?.full_name || 'غير محدد'}</TableCell>
                <TableCell>{service.views}</TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {service.status === 'pending-approval' ? t("table.pending_services_management.status.pending") : t("table.pending_services_management.status.approved")}
                  </Badge>
                </TableCell>
                <TableCell className='flex justify-end'>
                  <div className="flex gap-2">
                    <Dialog open={serviceToAccept?.id === service.id} onOpenChange={(open) => !open && setServiceToAccept(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setServiceToAccept(service)}>
                          <Edit className="size-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{t("table.pending_services_management.dialogs.edit_title")}</DialogTitle>
                        </DialogHeader>
                        <PendingServiceData
                          service={serviceToAccept || null}
                          setServiceToAccept={setServiceToAccept}
                        />
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
                          <AlertDialogTitle>{t("table.pending_services_management.dialogs.delete_title")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("table.pending_services_management.dialogs.delete_description", { title: service.title })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("table.pending_services_management.dialogs.cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteService(service.id)} className="bg-destructive text-destructive-foreground">
                            {t("table.pending_services_management.dialogs.confirm_delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("table.pending_services_management.empty_state")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PendingServicesManagement;