import React, { useContext, useEffect, useState } from "react";

// https://tailwindcss.com/docs/responsive-design
type ScreenSize = {
  name: "mobile" | "sm" | "md" | "lg" | "xl" | "2xl";
  minWidth: number | null;
  maxWidth: number | null;
  mediaQuery: string;
};

export const screenSizes: ScreenSize[] = [
  {
    name: "2xl",
    minWidth: 1536,
    maxWidth: null,
    mediaQuery: "(min-width: 1536px)",
  },
  {
    name: "xl",
    minWidth: 1280,
    maxWidth: 1535,
    mediaQuery: "(min-width: 1280px)",
  },
  {
    name: "lg",
    minWidth: 1024,
    maxWidth: 1279,
    mediaQuery: "(min-width: 1024px)",
  },
  {
    name: "md",
    minWidth: 768,
    maxWidth: 1023,
    mediaQuery: "(min-width: 768px)",
  },
  {
    name: "sm",
    minWidth: 640,
    maxWidth: 767,
    mediaQuery: "(min-width: 640px)",
  },
  {
    name: "mobile",
    minWidth: null,
    maxWidth: 639,
    mediaQuery: "(max-width: 639px)",
  },
];

const ScreenSizeContext = React.createContext<ScreenSize | undefined>(
  undefined
);

type Props = {
  children: React.ReactNode;
};
export function ScreenSizeProvider({ children }: Props) {
  const [screenSize, setScreenSize] = useState<ScreenSize>();

  useEffect(() => {
    const queryLists = Object.values(screenSizes).map((s) =>
      window.matchMedia(s.mediaQuery)
    );
    const matches = queryLists.map((ql) => ql.matches);

    function _setScreenSize() {
      for (let i = 0; i < matches.length; i++) {
        if (matches[i]) {
          setScreenSize(screenSizes[i]);
          return;
        }
      }
    }

    const changeListener = (e: MediaQueryListEvent) => {
      const mediaQueries = queryLists.map((ql) => ql.media);
      matches[mediaQueries.indexOf(e.media)] = e.matches;
      _setScreenSize();
    };

    queryLists.forEach((ql) => ql.addEventListener("change", changeListener));

    _setScreenSize();

    return () => {
      queryLists.forEach((ql) =>
        ql.removeEventListener("change", changeListener)
      );
    };
  }, []);

  return (
    <ScreenSizeContext.Provider value={screenSize}>
      {children}
    </ScreenSizeContext.Provider>
  );
}

export function useScreenSize() {
  return useContext(ScreenSizeContext);
}
