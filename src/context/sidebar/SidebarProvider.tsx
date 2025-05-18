import { useEffect, useMemo, type FC, type ReactNode, useReducer } from "react";
import { SidebarContext } from "./SidebarContext";

type State = {
  left: boolean;
  right: boolean;
  isMobile: boolean;
};

type Action =
  | { type: "TOGGLE_LEFT" }
  | { type: "CLOSE_LEFT" }
  | { type: "OPEN_RIGHT" }
  | { type: "CLOSE_RIGHT" }
  | { type: "IS_MOBILE" }
  | { type: "INIT"; payload: State };

const initialState: State = {
  left: localStorage.getItem("sidebarLeft") === "true",
  right: localStorage.getItem("sidebarRight") === "true",
  isMobile: false,
};

const reducers = (state: State, action: Action) => {
  switch (action.type) {
    case "TOGGLE_LEFT":
      return { ...state, left: !state.left };
    case "OPEN_RIGHT":
      return { ...state, right: true };
    case "CLOSE_LEFT":
      return { ...state, left: !state.left };
    case "CLOSE_RIGHT":
      return { ...state, right: false };
    case "IS_MOBILE":
      return { ...state, isMobile: !state.isMobile };
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
    const isMobile = window.innerWidth <= 768;
    dispatch({ type: "INIT", payload: { left, right, isMobile } });
  }, []);

  // Sync to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebarLeft", String(state.left));
    localStorage.setItem("sidebarRight", String(state.right));
  }, [state]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateMobileStatus = (e: MediaQueryList | MediaQueryListEvent) => {
      const isMobile = e.matches;
      dispatch({ type: "IS_MOBILE" });

      if (isMobile) {
        dispatch({ type: "CLOSE_RIGHT" });
      }
    };

    // Initial check
    updateMobileStatus(mediaQuery);

    mediaQuery.addEventListener("change", updateMobileStatus);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileStatus);
    };
  }, []);

  const value = useMemo(
    () => ({
      sidebarLeftIsVisible: state.left,
      sidebarRightIsVisible: state.right,
      toggleSidebarLeft: () => dispatch({ type: "TOGGLE_LEFT" }),
      openSidebarRight: () => dispatch({ type: "OPEN_RIGHT" }),
      closeSidebarLeft: () => dispatch({ type: "CLOSE_LEFT" }),
      closeSidebarRight: () => dispatch({ type: "CLOSE_RIGHT" }),
      isMobile: state.isMobile,
    }),
    [state]
  );

  return (
    // <div>hi</div>
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
