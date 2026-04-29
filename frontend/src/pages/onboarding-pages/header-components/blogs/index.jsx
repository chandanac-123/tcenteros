import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import Header from "@pages/onboarding-pages/components/Header";
import React from "react";
import BlogCards from "./components/BlogCards";

const BlogPage = () => {
  return (
    <SecondaryLayout>
      <Header />
      <BlogCards/>
    </SecondaryLayout>
  );
};

export default BlogPage;
