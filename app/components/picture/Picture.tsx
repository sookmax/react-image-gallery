"use client";

import createStore from "@/utils/createStore";
import React, {
  ComponentPropsWithRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ImageStatus = "preload" | "loading" | "loaded" | "cancelled";

const initialState = {
  aspectRatio: 1.667,
  previewUrl: "",
  showLoading: false,
  imageStatus: "preload" as ImageStatus,
};

const {
  ContextProvider,
  useState: useStoreState,
  useDispatch,
} = createStore(initialState);

export function Root({
  children,
  previewUrl = "",
  aspectRatio = 1.667,
}: {
  children: React.ReactNode;
  previewUrl?: string;
  aspectRatio?: number;
}) {
  const initialState = useMemo(() => {
    return { previewUrl, aspectRatio };
  }, [previewUrl, aspectRatio]);

  return (
    <ContextProvider initialState={initialState}>{children}</ContextProvider>
  );
}

type FigureProps = Omit<JSX.IntrinsicElements["figure"], "style"> & {
  aspectRatio: number;
  previewUrl: string;
};

const FigureImpl = React.memo(
  React.forwardRef<HTMLElement, FigureProps>(function FigureImpl(
    { aspectRatio, previewUrl, ...rest },
    ref
  ) {
    const dispatch = useDispatch();
    const elRef = useRef<HTMLElement | null>(null);

    const setRefs = useCallback<React.RefCallback<HTMLElement>>(
      (_ref) => {
        elRef.current = _ref;
        if (ref) {
          if (typeof ref === "function") {
            ref(_ref);
          } else {
            ref.current = _ref;
          }
        }
      },
      [ref]
    );

    useEffect(() => {
      if (elRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                dispatch((state) => {
                  state.imageStatus = "loading";
                });
              }
            }
          },
          { threshold: 0 }
        );

        observer.observe(elRef.current);

        return () => {
          dispatch((state) => {
            // this will trigger unnecessary image requests to be cancelled
            state.imageStatus = "cancelled";
          });
          observer.disconnect();
        };
      }
    }, [dispatch]);

    return (
      <figure
        ref={setRefs}
        {...rest}
        style={{
          position: "relative",
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
          backgroundImage: `url(${previewUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          overflow: "hidden",
        }}
      />
    );
  })
);

export const Figure = React.forwardRef<
  HTMLElement,
  Omit<ComponentPropsWithRef<typeof FigureImpl>, "previewUrl" | "aspectRatio">
>(function Figure(props, ref) {
  const { previewUrl, aspectRatio } = useStoreState();
  return (
    <FigureImpl
      ref={ref}
      aspectRatio={aspectRatio}
      previewUrl={previewUrl}
      {...props}
    />
  );
});

type ImgProps = Omit<JSX.IntrinsicElements["img"], "style"> & {
  imageStatus: ImageStatus;
  onLoad: () => void;
};

const ImgImpl = React.memo(
  React.forwardRef<HTMLImageElement, ImgProps>(function ImgImpl(
    { alt, src, srcSet, sizes, imageStatus, onLoad, ...rest },
    ref
  ) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (imageStatus === "loading") {
        const img = new Image();
        img.onload = () => {
          setLoaded(true);
          onLoad();
        };
        if (sizes) {
          img.sizes = sizes;
        }
        if (src) {
          img.src = src;
        }
        if (srcSet) {
          img.srcset = srcSet;
        }

        return () => {
          // console.log("canceled");
          img.src = "";
          img.srcset = "";
          img.remove();
        };
      }
    }, [imageStatus, src, srcSet, sizes, onLoad]);

    return (
      <img
        ref={ref}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        {...rest}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transitionProperty: "transform, opacity",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDuration: "300ms",
          transform: `scale(${loaded ? 1.0 : 1.2})`,
          opacity: loaded ? 1 : 0,
          visibility: loaded ? "visible" : "hidden",
        }}
      />
    );
  })
);

export const Img = React.forwardRef<
  HTMLImageElement,
  Omit<ComponentPropsWithRef<typeof ImgImpl>, "imageStatus" | "onLoad">
>(function Img(props, ref) {
  const { imageStatus } = useStoreState();
  const dispatch = useDispatch();

  const onLoad = useCallback(() => {
    dispatch((state) => {
      state.imageStatus = "loaded";
    });
  }, [dispatch]);

  return <ImgImpl imageStatus={imageStatus} onLoad={onLoad} {...props} />;
});

type SkeletonProps = Omit<JSX.IntrinsicElements["div"], "style"> & {
  imageStatus: ImageStatus;
};

const SkeletonImpl = React.memo(
  React.forwardRef<HTMLDivElement, SkeletonProps>(function SkeletonImpl(
    { imageStatus, ...rest },
    ref
  ) {
    return imageStatus === "loading" ? (
      <div
        ref={ref}
        {...rest}
        style={{
          position: "absolute",
          inset: 0,
          animation: `2.5s ease 0s infinite normal none running shimmer`,
          backgroundImage:
            "linear-gradient(to right, transparent, 45%, #e5e7eb, 55%, transparent)",
          opacity: 0.3,
        }}
      />
    ) : null;
  })
);

export const Skeleton = React.forwardRef<
  HTMLDivElement,
  Omit<ComponentPropsWithRef<typeof SkeletonImpl>, "imageStatus">
>(function Skeleton(props, ref) {
  const { imageStatus } = useStoreState();

  return <SkeletonImpl imageStatus={imageStatus} {...props} />;
});
