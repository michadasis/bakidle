"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Draws a hotlinked, cross-origin portrait onto a canvas instead of an <img>. There is no image
 * element for "Open image in new tab" to act on, and since the source carries no CORS header,
 * drawing it taints the canvas - the browser refuses "Save image as" on it too. Nothing is
 * painted until the source has actually decoded, so a slow connection never shows a name-bearing
 * placeholder the way an <img>'s alt text would while it loads.
 */
export function SecureImage({
  src,
  size,
  blur = 0,
  className,
  ariaLabel,
  onError,
}: {
  src: string;
  /** Backing resolution in CSS pixels; CSS on className scales the element's display size. */
  size: number;
  blur?: number;
  className?: string;
  ariaLabel?: string;
  onError?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(0);

  // Reloads only when the source itself changes, not on every blur-level change.
  useEffect(() => {
    imgRef.current = null;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      imgRef.current = img;
      setLoaded((n) => n + 1);
    };
    img.onerror = () => {
      if (!cancelled) onError?.();
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // object-fit: cover, object-position: top center, done by hand - canvas has no equivalent.
    // Crop to a square anchored to the top edge rather than centered vertically.
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (imgRatio > 1) {
      sw = img.naturalHeight;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth;
    }
    ctx.clearRect(0, 0, size, size);
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
  }, [loaded, size, blur]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      width={size}
      height={size}
    />
  );
}
