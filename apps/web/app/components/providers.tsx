"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { useDemoStore } from "@/app/lib/store/demo";
import { useUiStore } from "@/app/lib/store/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useDemoStore.persist.rehydrate();
    useUiStore.persist.rehydrate();
  }, []);

  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-line !bg-surface !text-ink !shadow-pop !font-sans",
          },
        }}
      />
    </ThemeProvider>
  );
}
