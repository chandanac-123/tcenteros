import SecondaryLayout from "@common/onboardlayouts/SecondaryLayout";
import Header from "@pages/onboarding-pages/components/Header";
import React from "react";
import BlogCards from "./components/BlogCards";
import FeaturedBlog from "./components/FeaturedBlog";

const BlogPage = () => {
  return (
    <SecondaryLayout>
      <Header />
      <div className="py-10">
        <FeaturedBlog />
        <BlogCards />
      </div>

    </SecondaryLayout>
  );
};

export default BlogPage;
