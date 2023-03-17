"use client";

import React from "react";
import { AppContextProvider, AppState } from "../store";
import { ScreenSizeProvider } from "@/utils/useScreenSize";
import ImageList from "./image-list/ImageList";
import ImageViewer from "./image-viewer/ImageViewer";
import BrowserHistoryHandler from "./BrowserHistoryHandler";
import NavBar from "./NavBar";

export default function ClientEntryPoint({
  initialState,
}: {
  initialState?: Partial<AppState>;
}) {
  return (
    <>
      <ScreenSizeProvider>
        <AppContextProvider initialState={initialState}>
          <NavBar />
          <ImageList />
          <ImageViewer />
          <BrowserHistoryHandler />
        </AppContextProvider>
      </ScreenSizeProvider>
      {/* <div className="fixed bottom-4 right-4">
        <button
          className="bg-white text-black p-2"
          onClick={() => {
            document.documentElement.scrollTop = 0;
          }}
        >
          Back to top
        </button>
      </div> */}
    </>
  );
}
