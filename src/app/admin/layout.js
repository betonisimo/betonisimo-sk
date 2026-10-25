import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Keep the editor toolbar visible when a mobile keyboard resizes the viewport.
export const metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default async function AdminLayout({ children }) {
  // Proxy is an early redirect, not the only authorization boundary.
  if (!await getServerSession()) redirect("/auth/signin");
  return children;
}
