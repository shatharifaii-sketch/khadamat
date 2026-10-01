import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { useTranslation } from "react-i18next";

const AuthHome = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  const { user } = useAuth();

  return (
    <>
      <section className="">
        <div className="px-3 py-1 bg-primary">
          <div className="flex justify-between items-center text-sm w-full lg:w-1/2 lg:mx-auto">
            <div className="flex gap-2 justify-start items-center text-muted">
              <p className="">{t("auth.welcome_message")}</p>
              <p className="">{t("auth.description")}</p>
            </div>
            <Button variant="outline" className="shimmer text-primary">
              {t("auth.become_member")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AuthHome;
