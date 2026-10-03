import ContactOptions from "@/components/Chat/ui/ContactOptions";
import { GeneratedAvatar } from "@/components/GeneratedAvatar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { TopProviderType } from "@/hooks/useProfile";
import { truncateString, validateWhatsappPhone } from "@/lib/utils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink } from "react-router-dom";

interface Props {
  provider: TopProviderType;
}

const TopProviderCardComponent = ({ provider }: Props) => {
  const { t } = useTranslation("home");

  const { user } = useAuth();
  const [isConvo, setIsConvo] = useState<boolean>(false);
  const [convoId, setConvoId] = useState<string>(null);

  const validWA = validateWhatsappPhone(provider.phone);
  return (
    <Card className="w-52 h-71">
      <CardHeader className="p-4 text-center h-56">
        <div
          className="
          mx-auto mb-3
          flex
          items-center justify-center
          text-primary
          transition-colors
          group-hover:bg-primary/15
        "
        >
          {provider.profile_image_url ? (
            <Avatar className="size-32">
              <AvatarImage src={provider.profile_image_url} />
            </Avatar>
          ) : (
            <GeneratedAvatar
              seed={provider.full_name}
              variant="initials"
              className="size-32"
            />
          )}
        </div>

        <CardTitle className="line-clamp-1 text-lg font-semibold">
          <NavLink to={`/profile/${provider.id}`}>
            {truncateString(provider.full_name, 15)}
          </NavLink>
        </CardTitle>

        <CardDescription className="mt-1 text-xs">
          {provider.services.length}{" "}
          {provider.services.length > 1
            ? t("active_providers.services")
            : t("active_providers.service")}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-2">
        <ContactOptions
          className="flex-1"
          providerId={provider.id}
          userId={user?.id}
          providerName={provider.full_name}
          convoId={convoId}
          isConvo={isConvo}
          setConvoId={setConvoId}
          setIsConvo={setIsConvo}
          phone={provider.phone}
          whatsappNumber={validWA.valid ? validWA.formatted : null}
        />
      </CardFooter>
    </Card>
  );
};

export default TopProviderCardComponent;
