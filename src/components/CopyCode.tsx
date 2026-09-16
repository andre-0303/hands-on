"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Enfeita o markdown já renderizado no servidor: o Shiki continua fora do bundle do navegador.
export function CopyCode({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !navigator.clipboard) return;

    root.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-code")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code";
      button.textContent = "Copiar";
      pre.appendChild(button);
    });

    const timers: number[] = [];
    const onClick = async (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>(".copy-code");
      const code = button?.closest("pre")?.querySelector("code");
      if (!button || !code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = "Copiado";
      } catch {
        button.textContent = "Copie manualmente";
      }
      timers.push(window.setTimeout(() => (button.textContent = "Copiar"), 2000));
    };

    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={ref} className="md">
      {children}
    </div>
  );
}
