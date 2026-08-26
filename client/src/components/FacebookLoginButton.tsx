import React from "react";
import { startFacebookLogin } from "@/const";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface FacebookLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Custom label for the button. Defaults to "Continue with Facebook" / "เข้าสู่ระบบด้วย Facebook" */
  label?: string;
  /** Visual variant: 'solid' (Facebook blue) or 'outline' (white/transparent with blue icon) */
  buttonVariant?: "solid" | "outline";
  /** Loading state showing spinner */
  isLoading?: boolean;
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-5 h-5 fill-current", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function FacebookLoginButton({
  label = "เข้าสู่ระบบด้วย Facebook",
  buttonVariant = "solid",
  isLoading = false,
  onClick,
  className,
  disabled,
  ...props
}: FacebookLoginButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) return;
    if (onClick) {
      onClick(e);
    } else {
      startFacebookLogin();
    }
  };

  const isSolid = buttonVariant === "solid";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-3 w-full h-11 px-5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm outline-none cursor-pointer select-none",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1877F2]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none",
        isSolid
          ? "bg-[#1877F2] text-white hover:bg-[#166fe5] active:bg-[#1464cc] hover:shadow-md active:scale-[0.99]"
          : "bg-white dark:bg-card text-foreground border border-border hover:bg-accent/70 hover:border-[#1877F2]/40 text-slate-800 dark:text-slate-100",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin text-current" />
      ) : (
        <span
          className={cn(
            "flex items-center justify-center shrink-0",
            isSolid
              ? "text-white"
              : "text-[#1877F2]"
          )}
        >
          <FacebookIcon className="w-5 h-5" />
        </span>
      )}
      <span className="font-medium tracking-tight truncate">{label}</span>
    </button>
  );
}

export default FacebookLoginButton;
