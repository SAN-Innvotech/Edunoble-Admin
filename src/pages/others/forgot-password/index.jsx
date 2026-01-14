import Preloader from "@/components/common/Preloader";
import HeaderAuth from "@/components/layout/headers/HeaderAuth";
import AuthImageMove from "@/components/others/AuthImageMove";
import ForgotPasswordForm from "@/components/others/ForgotPasswordForm";
import React from "react";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title: "Forgot Password | Edunoble Admin",
  description:
    "Reset your Edunoble admin password securely using OTP verification.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="main-content">
      <MetaComponent meta={metadata} />
      <Preloader />

      <HeaderAuth />
      <div className="content-wrapper js-content-wrapper overflow-hidden">
        <section className="form-page js-mouse-move-container">
          <AuthImageMove />
          <ForgotPasswordForm />
        </section>
      </div>
    </div>
  );
}

