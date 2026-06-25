import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'
import { UserProfile } from '../UserManagement'
import { useAdminFunctionality } from '@/hooks/useAdminFunctionality'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { locations } from '@/components/FindService/ServiceCategories'
import { useTranslation } from 'react-i18next'

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
  is_admin?: boolean;
}

interface Props {
  editingUser?: UserProfile;
  closeForm: () => void
}

const countries = [
  { code: "970", label: "PS +970" },
  { code: "972", label: "IS +972" },
  { code: "966", label: "SA +966" },
  { code: "20", label: "EG +20" },
  { code: "971", label: "AE +971" },
  { code: "963", label: "SY +963" },
  { code: "962", label: "JO +962" },
  { code: "1", label: "US +1" },
];

const UserForm = ({ editingUser, closeForm }: Props) => {
  const { t } = useTranslation("admin");
  const lang = localStorage.getItem("language") || "en";

  const { updateUser, updateUserSuccess, createUser, createUserSuccess } = useAdminFunctionality();
  const [countryCode, setCountryCode] = useState<string>(editingUser?.phone ? editingUser.phone.replace(/\D/g, '').slice(0, -9) : countries[0].code);
  const [phone, setPhone] = useState<string>(editingUser?.phone ? (editingUser.phone.replace(/\D/g, '').slice(-9) || editingUser.phone) : '');
  const [loading, setLoading] = useState(false);

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
    experience_years: 0,
    is_admin: false,
  });

  const handleCreateUser = () => {
    // Implement user creation logic here
    const formattedPhone =
      phone.length > 0
        ? `+${countryCode}${phone}`
        : "";

    const payload = {
      ...formData,
      phone: formattedPhone,
    };

    editingUser ? updateUser.mutate(payload) : createUser.mutate(payload);

  }
  return (
    <div className="space-y-4 text-start" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <Label htmlFor="email">{t("table.user_management.form.fields.email")}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="password">{t("table.user_management.form.fields.password")}</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="full_name">{t("table.user_management.form.fields.full_name")}</Label>
        <Input
          id="full_name"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="phone">{t("table.user_management.form.fields.phone")}</Label>
        <div className='grid grid-cols-5 items-center gap-2'>
          <Select
            value={countryCode}
            onValueChange={(e) => setCountryCode(e)}
            dir="rtl"
          >
            <SelectTrigger className="col-span-2">
              <SelectValue placeholder={t("table.user_management.form.placeholders.country_code")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {countries.map((c) => (
                  <SelectItem
                    key={c.code} value={c.code}
                  >
                    <div className="flex items-center gap-2">
                      {c.label}
                    </div>
                  </SelectItem>
                )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");

              // limit digits
              setPhone(numericValue.slice(0, 9));
            }}
            placeholder="599123456"
            dir="ltr"
            className='col-span-3'
            maxLength={9}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="location">{t("table.user_management.form.fields.location")}</Label>
        <Select
          value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}
        >
          <SelectTrigger id="location">
            <SelectValue placeholder={t("table.user_management.form.placeholders.select_location")} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="bio">{t("table.user_management.form.fields.bio")}</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>
      <div className='flex justify-between'>
        <div className="flex items-center space-x-2" dir='ltr'>

          <Label htmlFor="is_service_provider">{t("table.user_management.form.toggles.service_provider")}</Label>
          <Switch
            id="is_service_provider"
            checked={formData.is_service_provider}
            onCheckedChange={(checked) => setFormData({ ...formData, is_service_provider: checked })}
            className='relative'
          />
        </div>
        <div className="flex items-center space-x-2" dir='ltr'>

          <Label htmlFor="is_admin">{t("table.user_management.form.toggles.admin")}</Label>
          <Switch
            id="is_admin"
            checked={formData.is_admin}
            onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
            className='relative'
          />
        </div>
      </div>
      {formData.is_service_provider && (
        <div>
          <Label htmlFor="experience_years">{t("table.user_management.form.fields.experience_years")}</Label>
          <Input
            id="experience_years"
            type="number"
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
          />
        </div>
      )}
      <Button onClick={handleCreateUser} disabled={createUser.isPending} className={`w-full ${createUser.isPending ? 'opacity-50' : ''}`}>
        {editingUser
          ? t("table.user_management.form.buttons.update")
          : t("table.user_management.form.buttons.create")
        }
      </Button>
    </div>
  )
}

export default UserForm