import { ReactNode } from "react";

export default function OrganizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}