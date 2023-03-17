import { getImage, ImgData } from "@/app/data";
import { useAppDispatch, useAppState } from "@/app/store";
import classNames from "@/utils/classNames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useRef, useState } from "react";
import { Direction } from "./ImageViewer";
import * as Picture from "@/app/components/picture/Picture";

const Thumbnails = React.memo(function Thumbnails({
  height = 80,
  aspect = 1.5,
  neighbors = 10,
  setDirection,
}: {
  height?: number;
  aspect?: number;
  neighbors?: number;
  setDirection: (direction: Direction) => void;
}) {
  const dispatch = useAppDispatch();
  const { currentImageIndex } = useAppState();

  const createOnClick = useCallback(
    (id: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (id === currentImageIndex) return;

      if (id < currentImageIndex) {
        setDirection("left");
      } else {
        setDirection("right");
      }

      dispatch((state) => {
        state.currentImageIndex = id;
      });
    },
    [dispatch, currentImageIndex, setDirection]
  );

  const thumbnails: (ImgData | number)[] = [];
  for (let i = -neighbors; i <= neighbors; i++) {
    const image = getImage(currentImageIndex + i);
    if (image) {
      thumbnails.push(image);
    } else {
      thumbnails.push(currentImageIndex + i);
    }
  }

  const itemWidth = aspect * height;

  return (
    <ul
      className="absolute top-1/2 left-1/2 flex opacity-95"
      style={{
        height,
        transform: `translate(-${
          itemWidth * neighbors + itemWidth / 2
        }px, -50%)`,
      }}
    >
      <AnimatePresence initial={false}>
        {thumbnails.map((item, index) => {
          const id = typeof item === "number" ? item : item.id;
          return (
            <motion.li
              key={id}
              // key={index}
              data-image-id={id}
              layout
              initial={{
                opacity: 0,
                width: 0,
                padding: 0,
              }}
              animate={{
                opacity: 1,
                width: itemWidth,
                scale: id === currentImageIndex ? 1.3 : 1,
                paddingLeft: 2,
                paddingRight: 2,
              }}
              exit={{
                opacity: 0,
                width: 0,
                padding: 0,
              }}
              // transition={{
              //   x: { type: "spring", stiffness: 300, damping: 30 },
              //   opacity: { duration: 0.2 },
              // }}
              className={classNames("px-1")}
              style={{
                width: itemWidth,
                flexShrink: 0,
                visibility: typeof item === "number" ? "hidden" : "visible",
                zIndex: id === currentImageIndex ? 1 : 0,
              }}
            >
              <button
                onClick={createOnClick(id)}
                tabIndex={-1}
                className={classNames(
                  "w-full transition-all duration-300",
                  ["focus-visible:outline-none"],
                  id === currentImageIndex
                    ? "brightness-110"
                    : "brightness-50 hover:brightness-105"
                )}
              >
                {typeof item === "object" && (
                  <Picture.Root
                    key={id}
                    previewUrl={item.placeholderUrl}
                    aspectRatio={aspect}
                  >
                    <Picture.Figure data-image-index={item.id}>
                      <Picture.Skeleton />
                      <Picture.Img
                        loading="lazy"
                        srcSet={item.srcSet}
                        sizes={`${itemWidth}px`}
                      />
                    </Picture.Figure>
                  </Picture.Root>
                )}
              </button>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
});

export default Thumbnails;
