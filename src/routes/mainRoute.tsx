import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RouteList } from "./RouteList";
import Loading from "../pages/loading";
import Login from "../pages/login";
import Register from "../pages/register";
import NoPage from "../pages/errors/404";
import SidebarLayout from "../layout/sidebar/SidebarLayout";
import { UseAuth } from "../context/auth/AuthContext";

const MainRoute = () => {
  const { isAuthorized, isLoading } = UseAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route
          path="/login"
          element={isAuthorized ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthorized ? <Navigate to="/" replace /> : <Register />}
        />

        <Route element={<SidebarLayout />}>
          {RouteList.map((item, index) => {
            const Component = item.location;
            return (
              <Route
                key={index}
                path={item.path}
                element={
                  !isAuthorized ? (
                    <Navigate to="/login" replace />
                  ) : (
                    <Component />
                  )
                }
              />
            );
          })}
        </Route>

        <Route path="*" element={<NoPage />} />
      </Routes>
    </Suspense>
  );
};

export default MainRoute;
