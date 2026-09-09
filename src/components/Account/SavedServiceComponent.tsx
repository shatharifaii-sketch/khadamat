import { SavedService } from "@/hooks/useProfile";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useTranslation } from "react-i18next";
import { Bookmark, Dot } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { truncateString } from "@/lib/utils";

interface Props {
  service: SavedService["service"];
}

const SavedServiceComponent = ({ service }: Props) => {
  const { t } = useTranslation("account");
  const lang = localStorage.getItem("language") || "en";

  return (
    <Card className="text-start" dir={lang == "en" ? "ltr" : "rtl"}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>
            <Link to={`/find-service/${service.id}`}>
            {truncateString(service.title, 15)}
            </Link>
          </CardTitle>
          <CardDescription>
            <p className="text-start">{service.phone}</p>
          </CardDescription>
        </div>

        <Button variant="secondary">
            <Bookmark fill="fill" />
            {t("saved_service.remove_service")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <p className="text-muted-foreground">
            {service.is_online
              ? t("saved_service.is_online")
              : service.location || ""}
          </p>
          <Dot />
          <p>{service.price_range}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedServiceComponent;
