import { useCallback, useEffect, useMemo } from "react";
import { useAppState } from "../store";
import debounce from "lodash/debounce";

export default function BrowserHistoryHandler() {
  const { isViewerOpen, currentImageIndex } = useAppState();

  // To prevent the browser warning:
  //  "SecurityError: Attempt to use history.replaceState() more than 100 times per 30 seconds"
  const handleHistoryChange = useMemo(() => {
    return debounce(
      (currentImageIndex: number) => {
        if (currentImageIndex > -1) {
          if (isViewerOpen) {
            history.replaceState(null, "", `/p/${currentImageIndex}`);
          } else {
            history.replaceState(null, "", `/`);
          }
        }
      },
      300,
      { leading: false }
    );
  }, [isViewerOpen]);

  useEffect(() => {
    handleHistoryChange(currentImageIndex);
  }, [handleHistoryChange, currentImageIndex]);

  return null;
}
