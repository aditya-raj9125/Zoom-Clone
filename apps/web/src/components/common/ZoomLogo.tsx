import React from "react";
import Image from "next/image";

interface ZoomLogoProps {
  variant?: "white" | "blue";
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  priority?: boolean;
}

export function ZoomLogo({
  variant = "white",
  className = "h-7 w-auto object-contain",
  width = 110,
  height = 25,
  alt = "Zoom",
  priority = true,
}: ZoomLogoProps) {
  const src =
    variant === "blue"
      ? "/assets/branding/logo-zoom-blue@2x.png"
      : "/assets/branding/logo-zoom-white@2x.png";

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
