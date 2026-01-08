import PageLinks from "@/components/common/PageLinks";
import Preloader from "@/components/common/Preloader";
import CourseListThree from "@/components/courseList/CourseListThree";

import FooterOne from "@/components/layout/footers/FooterOne";
import Header from "@/components/layout/headers/Header";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title:
    "Sample Papers for Class 8, 9, 10, 11 & 12 | Edunoble - Free Practice Papers",
  description:
    "Browse and practice with free sample papers for Class 8, 9, 10, 11, and 12 students. CBSE, ICSE, and State Board sample papers available in secure online viewing environment.",
};

export default function CourseListPage3() {
  return (
    <div className="main-content  ">
      <MetaComponent meta={metadata} />
      <Preloader />
      <Header />
      <div className="content-wrapper  js-content-wrapper overflow-hidden">
        {/* <PageLinks /> */}
        <CourseListThree />
        <FooterOne />
      </div>
    </div>
  );
}
