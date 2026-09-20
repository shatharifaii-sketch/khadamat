import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const ChatDealsLoader = () => {
  return (
    <div className="w-full min-h-[250px]">
      <div className="text-start flex flex-col mb-2">
        <Skeleton className="min-h-[40px] w-[150px] mb-1" />
        <Skeleton className="min-h-[20px] w-[200px]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Skeleton className="min-h-[200px] w-full" />
        <Skeleton className="min-h-[200px] w-full" />
        <Skeleton className="min-h-[200px] w-full" />
      </div>
    </div>
  );
};

export default ChatDealsLoader;
