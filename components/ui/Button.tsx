"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "surface" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "ui-btn-primary",
  outline: "ui-btn-outline",
  surface: "ui-btn-surface",
  danger: "ui-btn-danger",
};

function cx(...parts: Array<string | undefined | false | null>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  variant = "surface",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("ui-btn", VARIANT_CLASS[variant], className)}
      {...props}
    />
  );
}

