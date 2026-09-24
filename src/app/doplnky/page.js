export const dynamic = "force-dynamic";

import { getAccessories } from "@/actions/adminActions";
import AccessoryGrid from "@/components/catalog/AccessoryGrid";

export const metadata = {
  title: "Doplnky k betónovým plotom | BETONISSIMO.SK",
  description: "Prezrite si doplnky a príslušenstvo k betónovým plotom. Funkčné a dizajnové riešenia s uvedenými cenami.",
  alternates: { canonical: "/doplnky" },
};

export default async function AccessoriesPage() {
  const accessories = await getAccessories();

  return <AccessoryGrid accessories={accessories} />;
}
