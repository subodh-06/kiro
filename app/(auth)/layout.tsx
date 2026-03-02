import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/30">
      <div className="w-full max-w-md p-4">
        {children}
      </div>
    </div>
  );
}