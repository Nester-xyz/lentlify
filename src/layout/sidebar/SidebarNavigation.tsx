import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import { SidebarList } from "./SidebarList";

const SidebarNavigation = () => {
  const { sidebarLeftIsVisible } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activeItem = SidebarList.findIndex(
    (item) => item.sidebarPath === pathname
  );

  return (
    <nav className="flex-1 overflow-y-auto p-2">
      <ul className="space-y-2">
        {SidebarList.map((item, index) => {
          const isLogoutItem = item.sidebarItem === "Logout";
          const itemClass = `flex items-center p-3 ${
            sidebarLeftIsVisible ? "justify-center" : "space-x-3"
          } rounded-lg cursor-pointer ${
            activeItem === index
              ? "bg-blue-600 text-white"
              : "dark:text-gray-300 dark:hover:bg-gray-700 text-gray-700 hover:bg-gray-200"
          } transition-all duration-200`;

          return (
            <li key={index}>
              {isLogoutItem ? (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={itemClass}
                >
                  {item.sidebarIcon}
                  {!sidebarLeftIsVisible && (
                    <span className="font-medium">{item.sidebarItem}</span>
                  )}
                </button>
              ) : (
                <Link to={item.sidebarPath}>
                  <div className={itemClass}>
                    {item.sidebarIcon}
                    {!sidebarLeftIsVisible && (
                      <span className="font-medium">{item.sidebarItem}</span>
                    )}
                  </div>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default SidebarNavigation;
