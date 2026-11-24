import React, { Suspense } from 'react'
import ErrorBoundary from '../ErrorBoundary'
import PopularServicesList from './components/PopularServicesList'
import { useTranslation } from 'react-i18next';

const PopularServicesWrapper = () => {
  const { t } = useTranslation("home");
  const lang = localStorage.getItem("language") || "en";

  return (
    <div className="lg:w-4/6 mx-auto px-3 sm:px-5 md:px-10 py-7">
      <p className="text-lg md:text-2xl font-semibold text-start">
        {t("popular_services.title")}
      </p>
      <p className="text-sm md:text-md text-start text-muted-foreground">{t("popular_services.description")}</p>
      <div className="my-2 border-t border-muted-foreground/20" />
      <Suspense fallback={<div>Loading...</div>}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <PopularServicesList />
        </ErrorBoundary>
      </Suspense>
    </div>
  )
}

export default PopularServicesWrapper