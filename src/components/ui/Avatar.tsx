import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-20 w-20 text-2xl",
  xl: "h-28 w-28 text-4xl",
};

/** Colorful initials avatar (or image when a URL is given). */
export function Avatar({
  name,
  url,
  size = "md",
  className,
}: {
  name: string;
  url?: string | null;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  // Deterministic gradient from the name.
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white/10",
        sizeMap[size],
        className,
      )}
      style={
        url
          ? undefined
          : {
              backgroundImage: `linear-gradient(135deg, hsl(${hue} 80% 55%), hsl(${(hue + 60) % 360} 80% 50%))`,
            }
      }
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
