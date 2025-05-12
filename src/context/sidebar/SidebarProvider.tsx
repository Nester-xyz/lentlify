import { useEffect, useMemo, type FC, type ReactNode, useReducer } from "react";
import { SidebarContext } from "./SidebarContext";

type State = {
  left: boolean;
  right: boolean;
};

type Action =
  | { type: "TOGGLE_LEFT" }
  | { type: "TOGGLE_RIGHT" }
  | { type: "CLOSE_LEFT" }
  | { type: "CLOSE_RIGHT" }
  | { type: "INIT"; payload: State };

const initialState: State = {
  left: false,
  right: false,
};

const reducers = (state: State, action: Action) => {
  switch (action.type) {
    case "TOGGLE_LEFT":
      return { ...state, left: !state.left };
    case "TOGGLE_RIGHT":
      return { ...state, right: !state.right };
    case "CLOSE_LEFT":
      return { ...state, left: !state.left };
    case "CLOSE_RIGHT":
      return { ...state, right: !state.right };
    case "INIT":
      return action.payload;
    default:
      return state;
  }
};

type SidebarProviderProps = {
  children: ReactNode;
};

export const SidebarProvider: FC<SidebarProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducers, initialState);

  // Initialize from localStorage
  useEffect(() => {
    const left = localStorage.getItem("sidebarLeft") === "true";
    const right = localStorage.getItem("sidebarRight") === "true";
    dispatch({ type: "INIT", payload: { left, right } });
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebarLeft", String(state.left));
    localStorage.setItem("sidebarRight", String(state.right));
  }, [state]);

  const value = useMemo(
    () => ({
      sidebarLeftIsVisible: state.left,
      sidebarRightIsVisible: state.right,
      toggleSidebarLeft: () => dispatch({ type: "TOGGLE_LEFT" }),
      toggleSidebarRight: () => dispatch({ type: "TOGGLE_RIGHT" }),
      closeSidebarLeft: () => dispatch({ type: "CLOSE_LEFT" }),
      closeSidebarRight: () => dispatch({ type: "CLOSE_RIGHT" }),
    }),
    [state]
  );

  return (
    // <div>hi</div>
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
