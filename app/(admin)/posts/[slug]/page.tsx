"use client";

import { use } from "react";
import { PostsTable } from "@/components/admin/posts-table";

export default function PostsStatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <PostsTable statusSlug={slug} />;
}
