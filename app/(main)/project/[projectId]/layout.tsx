import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  // We still await params here to satisfy Next.js 15 requirements, 
  // even if we don't strictly use projectId in this wrapper anymore.
  await params;

  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <BarLoader color="#0A5BFF" />
              <p className="text-muted-foreground mt-4 font-medium text-sm">
                Loading Project Data...
              </p>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}