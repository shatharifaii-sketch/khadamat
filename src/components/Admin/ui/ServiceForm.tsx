import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { UserProfile } from "../ServiceManagement";
import { useAdminFunctionality } from "@/hooks/useAdminFunctionality";
import ServiceImages from "./ServiceImages";

interface Props {
    isEdit?: boolean;
    serviceProviders: UserProfile[];
    service?: Service; //TODO: Define service type
    closeForm: () => void
}

interface Service {
    title: string;
    category: string;
    description: string;
    price_range: string;
    location: string;
    phone: string;
    email: string;
    experience?: string;
    user_id: string;
    status: string;
    service_images: {
        id: string;
        image_name: string;
        image_url: string;
    }[];
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

const ServiceForm = ({ isEdit, serviceProviders, service, closeForm }: Props) => {
    const { createService, updateService, createServiceSuccess, updateServiceSuccess } = useAdminFunctionality();

    const [formData, setFormData] = useState(service ?? {
        title: '',
        category: '',
        description: '',
        price_range: '',
        location: '',
        phone: '',
        email: '',
        experience: '',
        user_id: '',
        status: 'published',
        service_images: [],
    });

    useEffect(() => {
  if (createServiceSuccess || updateServiceSuccess) {
    closeForm();
  }
}, [createServiceSuccess, updateServiceSuccess, closeForm]);


    useEffect(() => {
        if (service) setFormData(service);
    }, [service]);

    const handleSubmit = () => {
        console.log(formData);

        isEdit ? updateService.mutate(formData) : createService.mutate(formData);
    }

    return (
        <div className="space-y-4">

            <div className="flex flex-col overflow-y-scroll h-[510px] space-x-2 pr-3">
                <div className="ml-2">
                    <Label htmlFor="title">عنوان الخدمة</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
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


                </div>
                <ServiceImages
                onImagesChange={(images) => {
                    setFormData((prev) => ({ ...prev, service_images: images }));
                }}
                serviceImages={service ? service.service_images : []} />
            </div>

            <Button
                onClick={() => handleSubmit()}
                className="w-full"
            >
                {isEdit ? 'حفظ التغييرات' : 'إنشاء الخدمة'}
            </Button>
        </div>
    )
};

export default ServiceForm;