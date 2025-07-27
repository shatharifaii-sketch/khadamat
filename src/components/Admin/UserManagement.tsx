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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Eye } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  phone?: string;
  location?: string;
  bio?: string;
  is_service_provider: boolean;
  created_at: string;
  profile_image_url?: string;
  experience_years?: number;
}

interface UserManagementProps {
  users: UserProfile[];
  onUserUpdated: () => void;
}

export const UserManagement = ({ users, onUserUpdated }: UserManagementProps) => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    is_service_provider: false,
    experience_years: 0
  });

  const handleCreateUser = async () => {
    try {
      // For now, we'll create the profile directly since we don't have service_role access
      // In a production environment, this would be handled by a proper admin endpoint
      const tempUserId = crypto.randomUUID();
      
      // Create profile entry (simulating user creation)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: tempUserId,
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          is_service_provider: formData.is_service_provider,
          experience_years: formData.experience_years
        });

      if (profileError) throw profileError;

      toast({
        title: "تم إنشاء الملف الشخصي",
        description: "تم إنشاء ملف المستخدم الشخصي بنجاح",
      });

      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        location: '',
        bio: '',
        is_service_provider: false,
        experience_years: 0
      });
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          is_service_provider: formData.is_service_provider,
          experience_years: formData.experience_years
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المستخدم بنجاح",
      });

      setEditingUser(null);
      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete profile (in production, this would also delete from auth)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });

      onUserUpdated();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: '',
      password: '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      is_service_provider: user.is_service_provider || false,
      experience_years: user.experience_years || 0
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            إدارة المستخدمين
          </CardTitle>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                إنشاء حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إنشاء حساب مستخدم جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="full_name">الاسم الكامل</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                  <Label htmlFor="location">الموقع</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_service_provider"
                    checked={formData.is_service_provider}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_service_provider: checked })}
                  />
                  <Label htmlFor="is_service_provider">مقدم خدمة</Label>
                </div>
                {formData.is_service_provider && (
                  <div>
                    <Label htmlFor="experience_years">سنوات الخبرة</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
                <Button onClick={handleCreateUser} className="w-full">
                  إنشاء الحساب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>تاريخ التسجيل</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'غير محدد'}
                </TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.location || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.is_service_provider ? 'default' : 'secondary'}>
                    {user.is_service_provider ? 'مقدم خدمة' : 'عميل'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>تحرير بيانات المستخدم</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit_full_name">الاسم الكامل</Label>
                            <Input
                              id="edit_full_name"
                              value={formData.full_name}
                              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_phone">رقم الهاتف</Label>
                            <Input
                              id="edit_phone"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_location">الموقع</Label>
                            <Input
                              id="edit_location"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit_bio">نبذة شخصية</Label>
                            <Textarea
                              id="edit_bio"
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="edit_is_service_provider"
                              checked={formData.is_service_provider}
                              onCheckedChange={(checked) => setFormData({ ...formData, is_service_provider: checked })}
                            />
                            <Label htmlFor="edit_is_service_provider">مقدم خدمة</Label>
                          </div>
                          {formData.is_service_provider && (
                            <div>
                              <Label htmlFor="edit_experience_years">سنوات الخبرة</Label>
                              <Input
                                id="edit_experience_years"
                                type="number"
                                value={formData.experience_years}
                                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                              />
                            </div>
                          )}
                          <Button onClick={handleUpdateUser} className="w-full">
                            حفظ التغييرات
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
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
                            هل أنت متأكد من حذف المستخدم "{user.full_name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive text-destructive-foreground">
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