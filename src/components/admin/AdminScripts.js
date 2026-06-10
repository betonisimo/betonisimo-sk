"use client";

import { useEffect } from "react";

export default function AdminScripts({ code }) {
  useEffect(() => {
    if (!code) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = code;

    const createdScripts = [];

    wrapper.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");

      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }

      document.head.appendChild(newScript);
      createdScripts.push(newScript);
    });

    return () => {
      createdScripts.forEach((script) => script.remove());
    };
  }, [code]);

  return null;
}