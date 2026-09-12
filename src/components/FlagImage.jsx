import { Image } from "@/components/ui/image";
import { byCode } from "@/data/countries";

export default function FlagImage({
  code,
  className,
  alt,
  fittingType = "fill",
}) {
  const c = byCode(code);
  return (
    <Image
      src={`https://flagcdn.com/${code}.svg`}
      alt={alt || `Flag of ${c?.name || code}`}
      className={className}
      fittingType={fittingType}
    />
  );
}
