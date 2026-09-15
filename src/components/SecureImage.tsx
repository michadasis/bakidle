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
  /** Initial backing resolution, before the element has been laid out to measure for real. */
  size: number;
  blur?: number;
  className?: string;
  ariaLabel?: string;
  onError?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(0);
  // The box this actually renders at, not just the size prop: className is often a fluid
  // percentage width (the splash frame, the portrait hint bubble), so the two can disagree by
  // a lot depending on viewport. Drawing at the size prop's resolution regardless left the
  // canvas upscaled - and then downscaled again by CSS - into something visibly soft next to
  // the plain <img> it replaced.
  const [box, setBox] = useState({ w: size, h: size });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // getBoundingClientRect is synchronous and unaffected by tab visibility; ResizeObserver's
    // callback delivery is not; a backgrounded tab can otherwise leave the very first paint
    // stuck at the fallback size prop indefinitely, since its initial callback never arrives.
    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) setBox({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Reloads only when the source itself changes, not on every blur-level or box-size change.
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
    const w = Math.max(1, Math.round(box.w * dpr));
    const h = Math.max(1, Math.round(box.h * dpr));
    canvas.width = w;
    canvas.height = h;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // object-fit: cover, object-position: top center, done by hand - canvas has no equivalent.
    // Crop to a box matching this element's own aspect ratio, anchored to the top edge rather
    // than centered vertically.
    const targetRatio = box.w / box.h;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let sx = 0;
    let sy = 0;
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (imgRatio > targetRatio) {
      sw = img.naturalHeight * targetRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / targetRatio;
    }
    ctx.clearRect(0, 0, box.w, box.h);
    ctx.filter = blur ? `blur(${blur}px)` : "none";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, box.w, box.h);
  }, [loaded, box, blur]);

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
