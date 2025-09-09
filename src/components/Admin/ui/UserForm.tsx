import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import React, { useEffect, useState } from 'react'
import { UserProfile } from '../UserManagement'
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality'

export interface User {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  is_service_provider?: boolean;
  location?: string;
  bio?: string;
  experience_years?: number;
  password?: string;
}

interface Props {
  editingUser?: UserProfile;
  closeForm: () => void
}

const UserForm = ({ editingUser, closeForm }: Props) => {
  const { updateUser, updateUserSuccess, createUser, createUserSuccess } = useAdminFunctionality();

  useEffect(() => {
    if (updateUserSuccess || createUserSuccess) {
      closeForm();
    }
  }, [updateUserSuccess, createUserSuccess, closeForm])

  const [formData, setFormData] = useState(editingUser ?? {
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

  const handleCreateUser = () => {
    // Implement user creation logic here
    console.log('Creating user with data:', formData);
    editingUser ? updateUser.mutate(formData) : createUser.mutate(formData);
  }
  return (
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
                <div className="flex items-center space-x-2" dir='ltr'>
                  
                  <Label htmlFor="is_service_provider">مقدم خدمة</Label>
                  <Switch
                    id="is_service_provider"
                    checked={formData.is_service_provider}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_service_provider: checked })}
                    className='relative'
                  />
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
  )
}

export default UserForm