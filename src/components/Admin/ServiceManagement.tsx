import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Service {
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
  profiles: {
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  full_name: string;
  is_service_provider: boolean;
}

interface ServiceManagementProps {
  services: Service[];
  users: UserProfile[];
  onServiceUpdated: () => void;
}

const serviceCategories = [
  'تنظيف المنازل',
  'صيانة السيارات',
  'التدريس الخصوصي',
  'التصوير',
  'التصميم الجرافيكي',
  'البناء والترميم',
  'الكهرباء',
  'السباكة',
  'الطبخ والتموين',
  'الحدائق والزراعة'
];

export const ServiceManagement = ({ services, users, onServiceUpdated }: ServiceManagementProps) => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    price_range: '',
    location: '',
    phone: '',
    email: '',
    experience: '',
    user_id: '',
    status: 'published'
  });

  const serviceProviders = users.filter(user => user.is_service_provider);

  const handleCreateService = async () => {
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          price_range: formData.price_range,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          experience: formData.experience,
          user_id: formData.user_id,
          status: formData.status
        });

      if (error) throw error;

      toast({
        title: "تم إنشاء الخدمة",
        description: "تم إنشاء الخدمة بنجاح",
      });

      setIsCreateModalOpen(false);
      resetForm();
      onServiceUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الخدمة",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async () => {
    if (!editingService) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          price_range: formData.price_range,
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          experience: formData.experience,
          status: formData.status
        })
        .eq('id', editingService.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث الخدمة بنجاح",
      });

      setEditingService(null);
      onServiceUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الخدمة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الخدمة بنجاح",
      });

      onServiceUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف الخدمة",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (serviceId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ status: newStatus })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الخدمة بنجاح",
      });

      onServiceUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      price_range: '',
      location: '',
      phone: '',
      email: '',
      experience: '',
      user_id: '',
      status: 'published'
    });
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      category: service.category,
      description: service.description,
      price_range: service.price_range,
      location: service.location,
      phone: service.phone,
      email: service.email,
      experience: service.experience || '',
      user_id: service.user_id,
      status: service.status
    });
  };

  const renderServiceForm = (isEdit = false) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">عنوان الخدمة</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="category">الفئة</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الفئة" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isEdit && (
        <div>
          <Label htmlFor="user_id">مقدم الخدمة</Label>
          <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر مقدم الخدمة" />
            </SelectTrigger>
            <SelectContent>
              {serviceProviders.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="price_range">النطاق السعري</Label>
        <Input
          id="price_range"
          value={formData.price_range}
          onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
          placeholder="مثال: 100-500 ريال"
        />
      </div>

      <div>
        <Label htmlFor="location">الموقع</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="experience">الخبرة</Label>
        <Textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="status">الحالة</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">منشور</SelectItem>
            <SelectItem value="draft">مسودة</SelectItem>
            <SelectItem value="disabled">معطل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={isEdit ? handleUpdateService : handleCreateService} 
        className="w-full"
      >
        {isEdit ? 'حفظ التغييرات' : 'إنشاء الخدمة'}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
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
              {renderServiceForm()}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>مقدم الخدمة</TableHead>
              <TableHead>المشاهدات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium max-w-xs truncate">
                  {service.title}
                </TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.profiles?.full_name || 'غير محدد'}</TableCell>
                <TableCell>{service.views}</TableCell>
                <TableCell>
                  <Badge variant={service.status === 'published' ? 'default' : 'secondary'}>
                    {service.status === 'published' ? 'منشور' : service.status === 'draft' ? 'مسودة' : 'معطل'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingService?.id === service.id} onOpenChange={(open) => !open && setEditingService(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>تحرير الخدمة</DialogTitle>
                        </DialogHeader>
                        {renderServiceForm(true)}
                      </DialogContent>
                    </Dialog>

                    {service.status !== 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(service.id, 'published')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}

                    {service.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(service.id, 'disabled')}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
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