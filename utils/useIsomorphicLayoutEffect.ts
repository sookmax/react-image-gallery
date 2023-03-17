import { useEffect, useLayoutEffect } from "react";

const isBrowser = typeof document !== "undefined";

export const useIsomorphicLayoutEffect = isBrowser
  ? useLayoutEffect
  : useEffect;
