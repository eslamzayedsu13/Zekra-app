import { createFileRoute, redirect } from "@tanstack/react-router";
import type React from "react";

export function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    hint?: string;
    error?: string;
  },
) {
  const { label, hint, error, id, className = "", ...rest } = props;
  const inputId = id || props.name;
  return (
    <label className="block text-start" htmlFor={inputId}>
      <span className="mb-1.5 block text-xs text-muted-foreground">{label}</span>
      <input
        id={inputId}
        {...rest}
        className={`h-11 w-full border ${
          error
            ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
            : "border-border focus:border-foreground"
        } bg-transparent px-3 text-sm outline-none transition-colors ${className}`}
      />
      {error ? (
        <span className="mt-1.5 block text-xs text-destructive">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
