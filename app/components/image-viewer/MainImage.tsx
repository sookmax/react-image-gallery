import debounce from "lodash/debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, DragHandlers, motion, Variants } from "framer-motion";
import * as Picture from "@/app/components/picture/Picture";
import { ImgData } from "@/app/data";
import { Direction } from "./ImageViewer";

/**
 * https://codesandbox.io/s/framer-motion-image-gallery-pqvx3?from-embed=&file=/src/Example.tsx:522-977
 *
 * Experimenting with distilling swipe offset and velocity into a single variable, so the
 * less distance a user has swiped, the more velocity they need to register as a swipe.
 * Should accomodate longer swipes and short flicks without having binary checks on
 * just distance thresholds and velocity > 0.
 */
const swipeConfidenceThreshold = 1000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const variants: Variants = {
  enter: (direction: Direction) => {
    const translateX =
      direction === "right" ? window.innerWidth : -window.innerWidth;
    return {
      opacity: 0,
      x: translateX,
    };
  },
  center: () => {
    return {
      opacity: 1,
      x: 0,
    };
  },
  exit: (direction: Direction) => {
    const translateX =
      direction === "right" ? -window.innerWidth : window.innerWidth;
    return {
      opacity: 0,
      x: translateX,
    };
  },
};

export default function MainImage({
  image,
  direction,
  onSwipeRight,
  onSwipeLeft,
  children,
  ...rest
}: {
  image: ImgData;
  direction: Direction;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
} & React.ComponentPropsWithoutRef<"div">) {
  const parentElRef = useRef<HTMLDivElement>(null);

  const onDragEnd = useCallback<Exclude<DragHandlers["onDragEnd"], undefined>>(
    (e, { offset, velocity }) => {
      e.stopPropagation();
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) {
        onSwipeRight();
      } else if (swipe > swipeConfidenceThreshold && image.id > 0) {
        onSwipeLeft();
      }
    },
    [image.id, onSwipeLeft, onSwipeRight]
  );

  // sometimes <AnimatePresence> doesn't remove the previous image properly
  // so we manually hide it after a short delay.
  // We don't remove the node because if we do, a 'React Error: NotFoundError' will be thrown.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (parentElRef.current && parentElRef.current.children.length > 1) {
        for (let i = 0; i < parentElRef.current.children.length - 1; i++) {
          (parentElRef.current.children[i] as HTMLElement).style.display =
            "none";
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [image.id]);

  return (
    <MainImageRoot imageAspectRatio={image.aspectRatio} {...rest}>
      {(rect) => {
        return (
          <>
            <motion.div
              className="relative"
              ref={parentElRef}
              layout
              initial={false}
              animate={rect}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  className="absolute inset-0"
                  key={image.id}
                  layout
                  variants={variants}
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "tween",
                    duration: 0.2,
                  }}
                  drag="x"
                  dragConstraints={{ left: -300, right: 300 }}
                  dragElastic={1}
                  dragSnapToOrigin={true}
                  onDragEnd={onDragEnd}
                >
                  <Picture.Root
                    key={image.id}
                    previewUrl={image.placeholderUrl}
                    aspectRatio={image.aspectRatio}
                  >
                    <Picture.Figure data-image-index={image.id}>
                      <Picture.Skeleton />
                      <Picture.Img
                        loading="lazy"
                        srcSet={image.srcSet}
                        sizes={
                          typeof rect.width === "number"
                            ? `(max-width: ${rect.width}px) 100vw, ${rect.width}px`
                            : undefined
                        }
                      />
                    </Picture.Figure>
                  </Picture.Root>
                </motion.div>
              </AnimatePresence>
            </motion.div>
            {children}
          </>
        );
      }}
    </MainImageRoot>
  );
}

function MainImageRoot({
  imageAspectRatio,
  children,
  ...rest
}: Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  imageAspectRatio: number;
  children: (rect: {
    width: string | number;
    height: string | number;
  }) => JSX.Element;
}) {
  const [rect, setRect] = useState<{
    width: string | number;
    height: string | number;
  }>();
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elRef.current) {
      const updateRect = () => {
        if (elRef.current) {
          const containerRect = elRef.current.getBoundingClientRect();
          const containerAspect = containerRect.width / containerRect.height;

          if (imageAspectRatio <= containerAspect) {
            setRect({
              width: Math.floor(containerRect.height * imageAspectRatio),
              height: "100%",
            });
          } else {
            setRect({
              width: "100%",
              height: Math.floor(containerRect.width / imageAspectRatio),
            });
          }
        }
      };

      const resizeObserver = new ResizeObserver(
        debounce(updateRect, 200, { leading: true })
      );

      const timeoutId = setTimeout(() => {
        elRef.current && resizeObserver.observe(elRef.current);
      }, 100);

      // https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
      // Unobserves all observed Element targets of a particular observer.
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, [imageAspectRatio]);

  return (
    <div ref={elRef} {...rest}>
      {rect && children(rect)}
    </div>
  );
}
