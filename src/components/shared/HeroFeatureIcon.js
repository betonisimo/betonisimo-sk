import {
  Calculator,
  CheckCircle,
  FileText,
  Hammer,
  HardHat,
  Home,
  Map,
  Paintbrush,
  Ruler,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

const HERO_FEATURE_ICONS = {
  Ruler,
  Wrench,
  Calculator,
  Truck,
  Paintbrush,
  FileText,
  ShieldCheck,
  Hammer,
  HardHat,
  CheckCircle,
  Home,
  Map,
};

export const HERO_FEATURE_ICON_NAMES = Object.keys(HERO_FEATURE_ICONS);

export default function HeroFeatureIcon({ name, ...props }) {
  const Icon = HERO_FEATURE_ICONS[name] || CheckCircle;

  return <Icon {...props} />;
}
