import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8 animate-fade-up">
      {/* 404 visual */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center border border-rose-100 shadow-lg shadow-rose-100/50">
          <span className="text-5xl font-black bg-gradient-to-br from-red-500 to-red-700 bg-clip-text text-transparent">404</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-xl rotate-12 opacity-20" />
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-400 rounded-lg -rotate-12 opacity-15" />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Page Not Found
      </h1>
      <p className="text-slate-500 mb-8 max-w-sm text-sm leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
        <Button asChild className="gap-2 shadow-lg shadow-red-500/20">
          <Link to="/"><Home className="w-4 h-4" /> Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

