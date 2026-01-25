import type { SyntheticEvent } from "react";
import Image from "next/image";
import { IMAGE_MASTERS } from "@/generated/image-masters";

type FetchPriority = "high" | "low" | "auto";

interface OptimizedPictureProps {
  imageKey: string;
  alt: string;
  className?: string; // Applied to the underlying image element (transforms, object-fit, filters, etc.)
  wrapperClassName?: string; // Used only when `fill` is true
  sizes?: string;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  fetchPriority?: FetchPriority;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  fill?: boolean;
}

function hasExplicitPositionClass(className?: string) {
  if (!className) return false;
  // Tailwind position utilities that would conflict if we force `relative`.
  return /(^|\s)(static|fixed|absolute|relative|sticky)(\s|$)/.test(className);
}

export function OptimizedPicture({
  imageKey,
  alt,
  className,
  wrapperClassName,
  sizes,
  loading,
  decoding = "async",
  fetchPriority,
  onError,
  fill = false,
}: OptimizedPictureProps) {
  const entry = IMAGE_MASTERS[imageKey];

  if (!entry) {
    // If the key is already a URL (e.g. /insights/image/...), render it directly.
    if (imageKey.startsWith("/")) {
      return (
        <img
          src={imageKey}
          alt={alt}
          className={className}
          loading={loading}
          decoding={decoding}
          {...(fetchPriority ? { fetchPriority } : {})}
          onError={onError}
        />
      );
    }
    return null;
  }

  const { src, width, height } = entry;
  const priority = loading === "eager" || fetchPriority === "high";

  if (fill) {
    // next/image `fill` requires the wrapper to establish a box (height/width) and be positioned.
    // We default to `relative`, but do NOT force it if the caller already set a position class
    // (e.g. `absolute inset-0`), otherwise Tailwind ordering can override `absolute` and collapse.
    const basePos = hasExplicitPositionClass(wrapperClassName) ? "" : "relative";

    return (
      <span className={[basePos, "block", wrapperClassName].filter(Boolean).join(" ")}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
          loading={loading}
          {...(fetchPriority ? { fetchPriority } : {})}
          // next/image uses the underlying <img> event type.
          onError={onError as any}
        />
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      loading={loading}
      {...(fetchPriority ? { fetchPriority } : {})}
      onError={onError as any}
    />
  );
}
