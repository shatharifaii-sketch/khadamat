import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { UserProfile } from "../ServiceManagement";
import { Service, useAdminFunctionality } from "@/hooks/useAdminFunctionality";
import { categories, locations } from "@/components/FindService/ServiceCategories";
import ServiceImages from "@/components/Service/ui/EditServiceImages";
import ServiceLinks, { ServiceLink } from "@/components/PostService/ServiceLinks";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

interface Props {
    isEdit?: boolean;
    serviceProviders: UserProfile[];
    service?: Service;
    closeForm: () => void
}

const ServiceForm = ({ isEdit, serviceProviders, service, closeForm }: Props) => {
    const { t } = useTranslation("admin");
    const lang = localStorage.getItem("language") || "en";

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
        service_media: [],
        is_online: false,
        links: [] as ServiceLink[],
        whatsapp_number: ''
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
        if (isEdit) { updateService.mutate(formData) } else { createService.mutate(formData) };
    }

    return (
        <div className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>

            <div className="flex flex-col overflow-y-scroll h-[510px] space-x-2 pr-3 text-start">
                <div className="ml-2">
                    <Label htmlFor="title">{t("table.service_management.form.title")}</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category">{t("table.service_management.form.category")}</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => {
                                    const Icon = category.icon;
                                    return (
                                        <SelectItem key={category.value} value={category.value}>
                                            <div className="flex items-center gap-2">
                                                <Icon size={18} />
                                                <span>{category.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    {!isEdit && (
                        <div>
                            <Label htmlFor="user_id">{t("table.service_management.form.provider")}</Label>
                            <Select value={formData.user_id} onValueChange={(value) => setFormData({ ...formData, user_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t("table.service_management.form.provider_placeholder")} />
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
                        <Label htmlFor="description">{t("table.service_management.form.description")}</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    </div>

                    <div>
                        <Label htmlFor="price_range">{t("table.service_management.form.price_range")}</Label>
                        <Input
                            id="price_range"
                            value={formData.price_range}
                            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                            placeholder={t("table.service_management.form.price_range_placeholder")}
                        />
                    </div>

                    <div>
                        <Label htmlFor="location">{t("table.service_management.form.location")}</Label>
                        <Select
                            value={formData.location} onValueChange={(value) => setFormData({ ...formData, location: value })}
                        >
                            <SelectTrigger id="location">
                                <SelectValue placeholder={t("table.service_management.form.location_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((loc) => (
                                    <SelectItem key={loc} value={loc}>
                                        {t(loc)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="phone">{t("table.service_management.form.phone")}</Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">{t("table.service_management.form.email")}</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="experience">{t("table.service_management.form.experience")}</Label>
                        <Textarea
                            id="experience"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="status">{t("table.service_management.form.status")}</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published">{t("table.service_management.form.status_published")}</SelectItem>
                                <SelectItem value="draft">{t("table.service_management.form.status_draft")}</SelectItem>
                                <SelectItem value="disabled">{t("table.service_management.form.status_disabled")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="whatsapp_number">{t("table.service_management.form.whatsapp_number")}</Label>
                        <Input
                            id="whatsapp_number"
                            value={String(formData.whatsapp_number)}
                            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                        />
                    </div>

                    <div className='grid grid-cols-2 my-2'>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id="offline"
                                checked={!formData.is_online}
                                onCheckedChange={() => setFormData({ ...formData, is_online: false })}
                            />
                            <Label htmlFor="offline">{t("table.service_management.form.offline_service")}</Label>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id="online"
                                checked={formData.is_online}
                                onCheckedChange={() => setFormData({ ...formData, is_online: true })}
                            />
                            <Label htmlFor="online">{t("table.service_management.form.online_service")}</Label>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <ServiceLinks
                            socialLinks={formData.links as ServiceLink[]}
                            onChange={(links) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    links
                                }));
                            }}
                        />
                    </div>


                </div>
                <ServiceImages
                    onMediaChange={(media) => {
                        setFormData((prev) => ({ ...prev, service_media: media }));
                    }}
                    serviceMedia={service ? service.service_media : []} />
            </div>

            <Button
                onClick={() => handleSubmit()}
                className="w-full"
            >
                {isEdit ? t("table.service_management.form.save_edit") : t("table.service_management.form.create")}
            </Button>
        </div>
    )
};

export default ServiceForm;