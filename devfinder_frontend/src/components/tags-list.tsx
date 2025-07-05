"use client";

import { useRouter } from "next/navigation";
import { badgeVariants } from "./ui/badge";
import { cn } from "@/lib/utils";

export function TagsList({ tags }: { tags: string[] }) {
  const router = useRouter();
  return (
    <div className="flex gap-2 flex-wrap">
      {tags.map((tag) => (
        <button
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm"
          key={tag}
          onClick={() => {
            router.push(`/browse?search=${tag}`);
          }}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
