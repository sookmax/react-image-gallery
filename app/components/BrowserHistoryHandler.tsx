import { useEffect } from "react";
import { useAppState } from "../store";

export default function BrowserHistoryHandler() {
  const { isViewerOpen, currentImageIndex } = useAppState();

  useEffect(() => {
    if (currentImageIndex > -1) {
      if (isViewerOpen) {
        history.replaceState(null, "", `/p/${currentImageIndex}`);
      } else {
        history.replaceState(null, "", `/`);
      }
    }
  }, [isViewerOpen, currentImageIndex]);

  return null;
}
