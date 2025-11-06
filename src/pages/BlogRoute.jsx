import React from "react";
import { useSearchParams } from "react-router-dom";
import Blog from "./Blog";
import BlogPost from "./BlogPost";

// Wrapper route: if ?slug= is present, show BlogPost; otherwise show Blog list
export default function BlogRoute() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");
  if (slug || id) return <BlogPost />;
  return <Blog />;
}
