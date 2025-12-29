import NotFound from "@/components/not-found/NotFound";
import PageLinks from "@/components/common/PageLinks";
import Preloader from "@/components/common/Preloader";

import FooterOne from "@/components/layout/footers/FooterOne";
import Header from "@/components/layout/headers/Header";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title:
    "Page not found || Edunoble - Sample Papers for Class 10, 11 & 12",
  description:
    "The page you're looking for doesn't exist. Browse our sample papers for Class 10, 11, and 12 students.",
};
export default function NotFoundPage() {
  return (
    <div className="main-content  ">
      <MetaComponent meta={metadata} />

      <Preloader />

      <Header />
      <div className="content-wrapper js-content-wrapper overflow-hidden">
        <PageLinks />
        <NotFound />
        <FooterOne />
      </div>
    </div>
  );
}
