import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RouteList } from "./RouteList";
import Loading from "../pages/loading";

const MainRoute = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Private Routes */}
        {RouteList.map((item, index) => {
          const Component = item.location;
          return <Route path={item.path} element={<Component />} key={index} />;
        })}
      </Routes>
    </Suspense>
  );
};

export default MainRoute;
