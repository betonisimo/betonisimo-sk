"use client"; // Uisti sa, že máš toto na začiatku súboru

import { useRouter } from "next/navigation"; // 1. Importuj router
import { Trash2 } from "lucide-react";
import { deleteAllCollectionsAction } from "@/actions/adminActions";

export default function DeleteAllCollectionsBtn() {
  const router = useRouter(); // 2. Inicializuj router

  const handleDelete = async () => {
    const confirmed = confirm(
      "POZOR! Naozaj chcete vymazať VŠETKY kolekcie? Táto akcia je nevratná a všetky štýly plotov zmiznú z webu."
    );

    if (confirmed) {
      const res = await deleteAllCollectionsAction();
      if (res.success) {
        // 3. Toto povie Next.js, aby znova spustil funkciu na získanie dát (Server Components)
        router.refresh(); 
        alert("Všetky kolekcie boli úspešne odstránené.");
      } else {
        alert("Chyba: " + res.error);
      }
    }
  };

  return (
    // <button
    //   onClick={handleDelete}
    //   className="px-4 py-2 text-red-500 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
    // >
    //   <Trash2 size={14} />
    //   Vymazať všetko
    // </button>
    false
  );
}