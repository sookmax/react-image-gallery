import { useScreenSize } from "@/utils/useScreenSize";

export default function useResponsiveCount(totalCount: number) {
  const screenSize = useScreenSize();

  if (!screenSize) return [undefined, undefined] as const;

  switch (screenSize?.name) {
    case "mobile":
      return [totalCount, 1] as const;
    case "sm":
    case "md":
    case "lg":
      return [Math.ceil(totalCount / 2), 2] as const;
    default:
      return [Math.ceil(totalCount / 3), 3] as const;
  }
}
