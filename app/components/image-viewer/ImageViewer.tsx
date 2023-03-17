import { useCallback, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { getImage } from "@/app/data";
import { useAppDispatch, useAppState } from "@/app/store";
import MainImage from "./MainImage";
import classNames from "@/utils/classNames";
import Thumbnails from "./Thumbnails";
import CrossIcon from "../icons/CrossIcon";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import ChevronRightIcon from "../icons/ChevronRightIcon";
import { useScreenSize } from "@/utils/useScreenSize";

export type Direction = "left" | "right";

export default function ImageViewer() {
  const screenSize = useScreenSize();
  const { currentImageIndex, isViewerOpen } = useAppState();
  const dispatch = useAppDispatch();

  const [direction, setDirection] = useState<Direction>("right");
  const [showDisplay, setShowDisplay] = useState(true);

  const onOpenChange = useCallback(
    (open: boolean) =>
      dispatch((state) => {
        state.isViewerOpen = open;
      }),
    [dispatch]
  );

  const onLeftClick = useCallback(() => {
    setDirection("left");
    dispatch((state) => {
      state.currentImageIndex--;
    });
  }, [dispatch]);

  const onRightClick = useCallback(() => {
    setDirection("right");
    dispatch((state) => {
      if (state.currentImageIndex < Number.MAX_SAFE_INTEGER) {
        state.currentImageIndex++;
      }
    });
  }, [dispatch]);

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      // console.log(e.key);
      if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        if (e.key === "ArrowRight") {
          onRightClick();
        } else if (e.key === "ArrowLeft") {
          onLeftClick();
        } else if (e.key === "ArrowUp") {
          setShowDisplay(true);
        } else if (e.key === "ArrowDown") {
          setShowDisplay(false);
        }
      }
    };

    window.addEventListener("keydown", keyListener, true);

    return () => {
      window.removeEventListener("keydown", keyListener, true);
    };
  }, [onRightClick, onLeftClick]);

  const mainImage = getImage(currentImageIndex);

  if (!mainImage) return null;

  return (
    <Dialog.Root open={isViewerOpen} onOpenChange={onOpenChange}>
      <Dialog.Overlay
        className={classNames(
          "fixed inset-0 z-10",
          "bg-black/90",
          "flex flex-col justify-center items-center",
          "focus:outline-none"
        )}
      >
        <Dialog.Content
          className="absolute inset-0 focus-visible:outline-none"
          // seems to resolve ios safari issue
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div
            className="absolute top-0 right-0 p-1 z-10 transition-transform duration-300"
            style={{
              transform: showDisplay ? "translateY(0)" : "translateY(-100%)",
            }}
          >
            <Dialog.Close
              className={classNames("w-10 h-10 p-2 bg-gray-800/20", [
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-inset",
                "focus-visible:ring-gray-500/50",
              ])}
            >
              <CrossIcon />
            </Dialog.Close>
          </div>
          <div
            className={classNames(
              "absolute top-0 left-1/2 -translate-x-1/2 z-10",
              "p-2 transition-transform duration-300"
            )}
            style={{
              transform: showDisplay
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
          >
            <span className="bg-gray-800/20 px-2 py-1 inline-block">
              {mainImage.id}
            </span>
          </div>
          <MainImage
            className="relative w-full h-full flex justify-center items-center"
            image={mainImage}
            direction={direction}
            onSwipeLeft={onLeftClick}
            onSwipeRight={onRightClick}
            onClick={() => setShowDisplay((prev) => !prev)}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 transition-transform duration-300 pl-1"
              style={{
                transform: showDisplay
                  ? "translate(0, -50%)"
                  : "translate(-100%, -50%)",
              }}
            >
              <button
                className={classNames("w-10 h-10 p-2 bg-gray-800/20", [
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-inset",
                  "focus-visible:ring-gray-500/50",
                ])}
                onClick={(e) => {
                  e.stopPropagation();
                  onLeftClick();
                }}
                style={{
                  display: currentImageIndex === 0 ? "none" : "block",
                }}
              >
                <ChevronLeftIcon />
              </button>
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 right-0 pr-2 transition-transform duration-300"
              style={{
                transform: showDisplay
                  ? "translate(0, -50%)"
                  : "translate(100%, -50%)",
              }}
            >
              <button
                className={classNames("w-10 h-10 p-2 bg-gray-800/20", [
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-inset",
                  "focus-visible:ring-gray-500/50",
                ])}
                onClick={(e) => {
                  e.stopPropagation();
                  onRightClick();
                }}
              >
                <ChevronRightIcon />
              </button>
            </div>
          </MainImage>
          <div
            className="absolute bottom-0 w-full transition-transform duration-300"
            style={{
              height: 100,
              transform: showDisplay ? "translateY(0)" : "translateY(100%)",
            }}
          >
            <Thumbnails
              setDirection={setDirection}
              height={70}
              neighbors={screenSize?.name === "mobile" ? 15 : 15}
            />
          </div>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Root>
  );
}
