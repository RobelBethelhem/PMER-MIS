import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";


export function Toaster() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-4 text-sm",
            t.variant === "destructive"
              ? "bg-rose-50 border-rose-200 text-rose-900"
              : t.variant === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-white border-slate-200 text-slate-900"
          )}
        >
          {t.title && <p className="font-semibold">{t.title}</p>}
          {t.description && <p className="opacity-80">{t.description}</p>}
        </div>
      ))}
    </div>

  );
}
