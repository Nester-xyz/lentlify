import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import { SidebarList } from "./SidebarList";

const SidebarNavigation = () => {
  const { sidebarLeftIsVisible } = useSidebar();
  const { pathname } = useLocation();
  // const navigate = useNavigate();

  const activeItem = SidebarList.findIndex(
    (item) => item.sidebarPath === pathname
  );

  return (
    <nav className="flex-1 overflow-y-auto p-2">
      <ul className="space-y-2">
        {SidebarList.map((item, index) => {
          return (
            <li key={index}>
              <Link to={item.sidebarPath}>
                <div className={`flex items-center p-1`}>
                  {sidebarLeftIsVisible ? (
                    <span
                      className={`
                        ${
                          activeItem === index
                            ? "bg-gray-200 dark:bg-gray-700"
                            : ""
                        }
                        font-medium flex justify-center items-center gap-3 text-xl`}
                    >
                      {item.sidebarIcon}
                      {item.sidebarItem}
                    </span>
                  ) : (
                    <span
                      className={`
                        ${
                          activeItem === index
                            ? "bg-gray-200 dark:bg-gray-700"
                            : ""
                        } font-medium flex justify-center items-center gap-3  mx-auto text-2xl `}
                    >
                      {item.sidebarIcon}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
