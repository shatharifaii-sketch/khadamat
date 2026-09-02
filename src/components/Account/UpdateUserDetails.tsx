import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { countries } from "@/types/constants";
import { locations } from "../FindService/ServiceCategories";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { splitPhoneNumber } from "@/utils/utils";
import { UseMutationResult } from "@tanstack/react-query";
import { UserProfile } from "@/hooks/useProfile";
import { validateWhatsappPhone } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { Dialog } from "../ui/dialog";
import PhoneVerification from "../PhoneVerification";

interface Props {
  rawPhone: string;
  profile: UserProfile;
  isServiceProvider: boolean;
  updateProfile: UseMutationResult<
    {
      bio: string | null;
      created_at: string;
      experience_years: number | null;
      full_name: string | null;
      id: string;
      is_service_provider: boolean | null;
      location: string | null;
      phone: string | null;
      profile_image_url: string | null;
      stripe_customer_id: string | null;
      updated_at: string;
      user_index: number | null;
    },
    unknown,
    Partial<UserProfile>,
    unknown
  >;
}

const UpdateUserDetails = ({
  rawPhone,
  updateProfile,
  profile,
  isServiceProvider,
}: Props) => {
  console.log(rawPhone, profile, updateProfile, isServiceProvider);
  const { t } = useTranslation("account");
  const [isUpdating, setIsUpdating] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [isNumberValid, setIsNumberValid] = useState(true);

  const lang = localStorage.getItem("language") || "en";

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    phone: "",
    experience_years: 0,
  });

  const userPhone = splitPhoneNumber(rawPhone);

  const [phone, setPhone] = useState<{
    countryCode: string;
    number: string;
  }>(userPhone);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        phone: profile.phone || "",
        experience_years: profile.experience_years || 0,
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const phoneValidation = validateWhatsappPhone(
        `+${phone.countryCode}${phone.number}`,
      );

      if (!phoneValidation.valid) {
        setIsNumberValid(false);
      } else {
        setIsNumberValid(true);
      }
    }
  }, [phone, profile]);

  const handlePhone = ({
    number: phone,
    countryCode: code,
  }: {
    number: string;
    countryCode: string;
  }) => {
    setPhone({
      number: phone,
      countryCode: code,
    });
  };

  const hanldePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "");

    handlePhone({
      ...phone,
      number: digits,
    });
  };

  const handleCountryChange = (code: string) => {
    handlePhone({
      ...phone,
      countryCode: code,
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === "phone" && typeof value === "string") {
      const phoneValidation = validateWhatsappPhone(value);

      console.log("PHONE VALIDATION: ", phoneValidation);

      if (!phoneValidation.valid) {
        setIsNumberValid(false);
      } else {
        setIsNumberValid(true);
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    setIsNumberValid(true);

    const phoneValidation = validateWhatsappPhone(formData.phone);

    if (!phoneValidation.valid) {
      setIsNumberValid(false);
    }

    const payload = {
      ...formData,
      phone: phoneValidation.formatted,
    };

    try {
      await updateProfile.mutateAsync(payload);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      toast.error("فشل في تحديث الملف الشخصي");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-start">
            <Label htmlFor="full_name">{t("full_name")}</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
              placeholder={t("full_name")}
            />
          </div>

          <div className="space-y-2 text-start">
            <Label htmlFor="phone">{t("phone")}</Label>
            <>
              <div className="flex items-center gap-1 md:gap-4" dir="ltr">
                <Select
                  value={phone.countryCode}
                  onValueChange={(e) => handleCountryChange(e)}
                  dir="rtl"
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder={t("verify_phone.code")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{lang == "ar" ? "رمز" : "Code"}</SelectLabel>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          <div className="flex items-center gap-2">
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Input
                  type="tel"
                  value={phone.number}
                  onChange={(e) => hanldePhoneChange(e.target.value)}
                  placeholder="599123456"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </>
            {!isNumberValid && (
              <p className="text-red-500 text-sm">{t("not_whatsapp_valid")}</p>
            )}
          </div>
        </div>

        <div className="space-y-2 text-start">
          <Label htmlFor="location">{t("location")}</Label>
          <Select
            value={formData.location}
            onValueChange={(value) => handleInputChange("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("select_location")} />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {t(location)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 text-start">
          <Label htmlFor="bio">{t("bio")}</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder={t("bio_placeholder")}
            rows={3}
          />
        </div>

        {isServiceProvider && (
          <>
            <Separator />
            <div className="space-y-4 text-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{t("service_provider")}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {t("service_provider_description")}
                  </span>
                </div>
                <Label htmlFor="experience_years">
                  {t("experience_years")}
                </Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) =>
                    handleInputChange(
                      "experience_years",
                      parseInt(e.target.value) || 0,
                    )
                  }
                  placeholder={t("experience_years_placeholder")}
                />
              </div>
            </div>
          </>
        )}

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving_changes")}
            </>
          ) : (
            t("save_changes")
          )}
        </Button>
      </form>

      <Dialog open={verifyingPhone}>
        <PhoneVerification phone={phone} />
      </Dialog>
    </>
  );
};

export default UpdateUserDetails;
