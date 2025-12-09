import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CustomLogoProps {
  href?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { image: 70, text: "text-xl" },
  md: { image: 100, text: "text-2xl" },
  lg: { image: 150, text: "text-3xl" },
  xl: { image: 250, text: "text-4xl" },
};

export function CustomLogo({
  href = "/",
  showText = true,
  size = "md",
  className,
}: CustomLogoProps) {
  const { image: imageSize, text: textSize } = sizeMap[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/purple-dog-logo.png"
        alt="Purple Dog Logo"
        width={imageSize}
        height={imageSize}
        className="rounded-md object-contain"
        priority
      />
      
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

