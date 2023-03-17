"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useAppDispatch, useAppState } from "@/app/store";
import useResponsiveCount from "./useResponsiveCount";
import * as Picture from "../picture/Picture";
import { getImage, ImgData } from "@/app/data";

const FETCH_COUNT = 12;
const PADDING_TOP = 0;
const PADDING_BOTTOM = 16;

export default function ImageList() {
  const { currentImageIndex, lastImageIndex, isViewerOpen } = useAppState();
  const dispatch = useAppDispatch();

  const imageCount =
    Math.max(currentImageIndex, lastImageIndex, 0) + FETCH_COUNT;

  // console.time("check");
  const [rowCount = 0, rowItemCount = 1] = useResponsiveCount(imageCount);
  const currentRowIndex = Math.floor(currentImageIndex / rowItemCount);

  // these refs are from the example:
  // https://codesandbox.io/s/github/tanstack/virtual/tree/beta/examples/react/dynamic?from-embed
  const parentRef = useRef<HTMLDivElement>(null);
  const rowHeightRef = useRef(500);
  const [scrollMargin, setScrollMargin] = useState(0);

  const maxRowCount = Math.floor(16777200 / rowHeightRef.current);

  const virtualizer = useWindowVirtualizer({
    count: Math.min(rowCount, maxRowCount),
    estimateSize: () => rowHeightRef.current,
    measureElement: (el, _, instance) => {
      rowHeightRef.current = el.getBoundingClientRect().height;
      return rowHeightRef.current;
    },
    scrollMargin,
    paddingStart: PADDING_TOP,
    paddingEnd: PADDING_BOTTOM,
  });

  const vItems = virtualizer.getVirtualItems();

  // console.timeEnd("check");

  const onImageClick = useCallback(
    (id: number) => {
      return () => {
        dispatch((state) => {
          state.currentImageIndex = id;
          state.isViewerOpen = true;
        });
      };
    },
    [dispatch]
  );

  useEffect(() => {
    if (vItems.length > 0 && parentRef.current) {
      setScrollMargin(parentRef.current.offsetTop);
    }
  }, [vItems.length]);

  useEffect(() => {
    // if (!isViewerOpen || currentRowIndex > maxRowCount - 1) return;
    if (isViewerOpen) return;

    const timeoutId = setTimeout(() => {
      if (currentRowIndex > -1) {
        // virtualizer.scrollToIndex(currentRowIndex, {
        //   align: "start",
        // });
        virtualizer.scrollToOffset(currentRowIndex * rowHeightRef.current);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [currentRowIndex, virtualizer, isViewerOpen]);

  if (vItems.length === 0 || isViewerOpen) return null;

  return (
    <div ref={parentRef} className="px-1">
      <div
        style={{
          height: virtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        <div
          style={{
            // these styles are absolutely necessary. They are from the example.
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", // without this, infinite re-render occurs
            transform: `translateY(${
              vItems[0].start - virtualizer.options.scrollMargin
            }px)`,
          }}
        >
          {vItems.map((vItem) => {
            const startIndex = vItem.index * rowItemCount;

            const lastRowCallback =
              vItem.index === virtualizer.options.count - 1
                ? () => {
                    if (!isViewerOpen) {
                      dispatch((state) => {
                        state.lastImageIndex = startIndex + rowItemCount - 1;
                      });
                    }
                  }
                : undefined;

            const rowImages: (ImgData | undefined)[] = [];
            for (let i = startIndex; i < startIndex + rowItemCount; i++) {
              rowImages.push(getImage(i));
            }

            return (
              <div
                className="pb-1"
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
              >
                <VirtualRowBody
                  className="flex"
                  lastRowCallback={lastRowCallback}
                >
                  {rowImages.map((image, idx) => {
                    return (
                      <div key={idx} className="flex-1 px-1">
                        {image && (
                          <button
                            className="w-full h-full"
                            onClick={onImageClick(image.id)}
                          >
                            <Picture.Root
                              previewUrl={image.placeholderUrl}
                              aspectRatio={rowItemCount === 1 ? 1.3 : 1.667}
                            >
                              <Picture.Figure data-image-index={image.id}>
                                <Picture.Skeleton />
                                <Picture.Img
                                  loading="lazy"
                                  srcSet={image.srcSet}
                                  sizes={`${Math.floor(
                                    (1 / rowItemCount) * 100
                                  )}vw`}
                                />
                              </Picture.Figure>
                            </Picture.Root>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </VirtualRowBody>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VirtualRowBody({
  lastRowCallback,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & { lastRowCallback?: () => void }) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastRowCallback && elRef.current) {
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            lastRowCallback();
          }
        }
      });
      observer.observe(elRef.current);
      return () => observer.disconnect();
    }
  }, [lastRowCallback]);

  return <div ref={elRef} {...rest} />;
}
