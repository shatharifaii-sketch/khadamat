import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Eye } from 'lucide-react';
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality';
import { NavLink } from 'react-router-dom';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import UserForm from './ui/UserForm';

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  password?: string;
  location?: string;
  bio?: string;
  is_service_provider: boolean;
  created_at: string;
  profile_image_url?: string;
  experience_years?: number;
}

interface UserManagementProps {
  users: UserProfile[];
}

type SortOption = "name-ar" | "name-en" | "date-asc" | "date-desc";

export const UserManagement = ({ users }: UserManagementProps) => {
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [formData, setFormData] = useState({
    id: editingUser?.id || '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    is_service_provider: false,
    experience_years: 0
  });
  const { deleteUser, updateUser } = useAdminFunctionality();

  const sortedUsers = useMemo(() => {
      if (!users) return [];
      return [...users].sort((a, b) => {
        if (sortOption === "date-desc") {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortOption === "name-ar") {
          return a.full_name.localeCompare(b.full_name, 'ar', { sensitivity: 'base' });
        } else if (sortOption === "name-en") {
          return a.full_name.localeCompare(b.full_name, 'en', { sensitivity: 'base' });
        } else if (sortOption === "date-asc") {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
      });
    }, [users, sortOption]);

  const handleDeleteUser = async (userId: string) => {
    try {
      deleteUser.mutate(userId);
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
      id: editingUser?.id || '',
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
      <CardHeader className='flex flex-col gap-3'>
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
              <UserForm closeForm={() => setIsCreateModalOpen(false)} />
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
              <TableHead className='text-end'>الاسم</TableHead>
              <TableHead className='text-end'>الهاتف</TableHead>
              <TableHead className='text-end'>الموقع</TableHead>
              <TableHead className='text-end'>النوع</TableHead>
              <TableHead className='text-end'>تاريخ التسجيل</TableHead>
              <TableHead className='text-end'>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <NavLink to={user.id ? `/profile/${user.id}` : '#'}>
                    {user.full_name || 'غير محدد'}
                  </NavLink>
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
                <TableCell className='flex items-center justify-center'>
                  <div className="flex gap-2">
                    <Button variant='link' size='sm' className='outline-primary outline outline-1'>
                      <NavLink to={`/profile/${user.id}`}>
                        <Eye className="size-4" />
                      </NavLink>
                    </Button>

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
                        <UserForm 
                          editingUser={editingUser}
                          closeForm={() => setEditingUser(null)}
                        />
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