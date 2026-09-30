// Keep the editor toolbar visible when a mobile keyboard resizes the viewport.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function AdminLayout({ children }) {
  return children;
}
