import React from "react";
import Wrapper from "./Wrapper";
import HomePage1 from "./homes/home-1";
import MetaComponent from "@/components/common/MetaComponent";

const metadata = {
  title:
    "Edunoble - Sample Papers for Class 10, 11 & 12 | Free Practice Papers",
  description:
    "Access free sample papers for Class 10, 11, and 12 students. Practice with CBSE, ICSE, and State Board sample papers to excel in your board exams. Secure online viewing environment.",
};

export default function index() {
  return (
    <Wrapper>
      <MetaComponent meta={metadata} />
      <HomePage1 />
    </Wrapper>
  );
}
