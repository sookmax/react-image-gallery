import produce from "immer";
import React, { useContext, useReducer } from "react";

export default function createStore<S>(initialState: S, debug = false) {
  type Action = (state: S) => void;
  const reducer = (state: S, action: Action) => {
    debug && console.log(state, produce(state, action));
    return produce(state, action);
  };

  const StateContext = React.createContext(initialState);
  const DispatchContext = React.createContext<React.Dispatch<Action> | null>(
    null
  );

  function ContextProvider({
    children,
    initialState: _initialState,
  }: {
    children: React.ReactNode;
    initialState?: Partial<S>;
  }) {
    const [state, dispatch] = useReducer(
      reducer,
      _initialState ? { ...initialState, ..._initialState } : initialState
    );
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  }

  function useState() {
    return useContext(StateContext);
  }

  function useDispatch() {
    const dispatch = useContext(DispatchContext);
    if (dispatch === null) {
      throw new Error("useDispatch must be used within a ContextProvider");
    }
    return dispatch;
  }

  return {
    ContextProvider,
    useState,
    useDispatch,
  };
}
