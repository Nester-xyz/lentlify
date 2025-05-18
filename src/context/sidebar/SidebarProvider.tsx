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
  | { type: "OPEN_LEFT" }
  | { type: "OPEN_RIGHT" }
  | { type: "CLOSE_RIGHT" }
  | { type: "SET_MOBILE"; payload: boolean }
  | { type: "INIT"; payload: State };

const initialState: State = {
  left: false,
  right: false,
  isMobile: false,
};

const reducers = (state: State, action: Action) => {
  switch (action.type) {
    case "TOGGLE_LEFT":
      return { ...state, left: !state.left };
    case "OPEN_LEFT":
      return { ...state, left: true };
    case "CLOSE_LEFT":
      return { ...state, left: false };
    case "OPEN_RIGHT":
      return { ...state, right: true };
    case "CLOSE_RIGHT":
      return { ...state, right: false };
    case "SET_MOBILE":
      return { ...state, isMobile: action.payload };
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

  // Initialize from localStorage and detect mobile on mount
  useEffect(() => {
    const left = localStorage.getItem("sidebarLeft") === "true";
    const right = localStorage.getItem("sidebarRight") === "true";
    const isMobile = window.innerWidth <= 768;

    dispatch({ type: "INIT", payload: { left, right, isMobile } });
  }, []);

  // Sync to localStorage when sidebar state changes (but not isMobile)
  useEffect(() => {
    localStorage.setItem("sidebarLeft", String(state.left));
    localStorage.setItem("sidebarRight", String(state.right));
  }, [state.left, state.right]);

  // Handle responsive behavior
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateMobileStatus = (e: MediaQueryList | MediaQueryListEvent) => {
      const isMobile = e.matches;
      dispatch({ type: "SET_MOBILE", payload: isMobile });

      // Auto-close right sidebar on mobile
      if (isMobile && state.right) {
        dispatch({ type: "CLOSE_RIGHT" });
      }
    };

    // Initial check (though this might be redundant with the INIT effect)
    updateMobileStatus(mediaQuery);

    mediaQuery.addEventListener("change", updateMobileStatus);
    return () => mediaQuery.removeEventListener("change", updateMobileStatus);
  }, [state.right]); // Add state.right dependency to check current state

  const value = useMemo(
    () => ({
      sidebarLeftIsVisible: state.left,
      sidebarRightIsVisible: state.right,
      toggleSidebarLeft: () => dispatch({ type: "TOGGLE_LEFT" }),
      openSidebarLeft: () => dispatch({ type: "OPEN_LEFT" }),
      openSidebarRight: () => dispatch({ type: "OPEN_RIGHT" }),
      closeSidebarLeft: () => dispatch({ type: "CLOSE_LEFT" }),
      closeSidebarRight: () => dispatch({ type: "CLOSE_RIGHT" }),
      isMobile: state.isMobile,
    }),
    [state]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
