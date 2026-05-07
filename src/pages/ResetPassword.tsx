import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { Home } from "lucide-react"
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"

type FormError = {
  message: string,
  field: string
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ message: string, field: string }[]>([]);

  const { changePassword } = useProfile();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const validate = (): FormError[] => {
    const newErrors: FormError[] = [];

    if (!formData.newPassword) {
      newErrors.push({
        field: 'newPassword',
        message: 'كلمة المرور الجديدة مطلوبة'
      })
    }

    if (formData.newPassword.length < 6) {
      newErrors.push({
        field: 'newPassword',
        message: 'كلمة المرور الجديدة يجب ان تكون على الاقل 6 حروف'
      })
    }

    if (!formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: 'تاكيد كلمة المرور مطلوب'
      })
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.push({
        field: 'confirmPassword',
        message: 'كلمة المرور غير متطابقة'
      })
    }

    return newErrors;
  }

  const getError = (field: string) => errors.find(e => e.field === field)?.message;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    setErrors(prev => prev.filter(e => e.field !== field));
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    await changePassword.mutateAsync(formData.newPassword);
  }

  useEffect(() => {
    if (changePassword.isSuccess) {
      setFormData({ newPassword: '', confirmPassword: '' });
      navigate('/', { replace: true });
    }
  }, [changePassword.isSuccess, changePassword.isError, changePassword.mutateAsync]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 arabic">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 space-x-reverse mb-6">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Home size={24} />
            </div>
            <span className="text-2xl font-bold text-primary">خدمتك</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription>
              سيتم تغيير كلمة المرور الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center mb-3">سنرسل لك رابطا لتجديد كلمة المرور</p>
            <div className='flex flex-col gap-2'>
              <div>
                <Label>كلمة المرور الجديدة</Label>
                <Input
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                />
                {getError('newPassword') && (
                  <p className="text-red-500 text-sm mt-1">
                    {getError('newPassword')}
                  </p>
                )}
              </div>
              <div>
                <Label>أعد كلمة المرور الجديدة</Label>
                <Input
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                />
                {getError('confirmPassword') && (
                  <p className="text-red-500 text-sm mt-1">
                    {getError('confirmPassword')}
                  </p>
                )}
              </div>

              {getError('server') && (
                <p className="text-red-500 text-sm mt-1">
                  {getError('server')}
                </p>
              )}
            </div>

            <Button
                onClick={handleSubmit}
                className='flex-1'
                disabled={changePassword.isPending}
              >
                تغيير كلمة المرور
              </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword