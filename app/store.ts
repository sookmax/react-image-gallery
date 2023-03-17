import createStore from "@/utils/createStore";

const initialState = {
  currentImageIndex: -1,
  lastImageIndex: -1,
  isViewerOpen: false,
};

export type AppState = typeof initialState;

const store = createStore(initialState);

export const AppContextProvider = store.ContextProvider;
export const useAppState = store.useState;
export const useAppDispatch = store.useDispatch;
