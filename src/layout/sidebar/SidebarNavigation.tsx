import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/sidebar/SidebarContext";
import { SidebarList } from "./SidebarList";

const SidebarNavigation = () => {
  const { sidebarLeftIsVisible } = useSidebar();
  const { pathname } = useLocation();

  const activeItem = SidebarList.findIndex(
    (item) => item.sidebarPath === pathname
  );

  return (
    <nav
      className={`flex-1 overflow-y-auto p-2 transition-all duration-300 ${
        sidebarLeftIsVisible ? "w-60" : "w-20"
      } bg-white dark:bg-gray-900`}
    >
      <ul className="space-y-2 w-full">
        {SidebarList.map((item, index) => {
          return (
            <li key={index}>
              <Link to={item.sidebarPath}>
                <div className={`flex items-center w-full`}>
                  {sidebarLeftIsVisible ? (
                    <span
                      className={` 
                        flex items-center p-3 gap-2 ${
                          !sidebarLeftIsVisible ? "justify-center" : "space-x-3"
                        } rounded-lg cursor-pointer ${
                        activeItem === index
                          ? "bg-gray-700 text-white"
                          : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                      } transition-all duration-200  w-full
                        `}
                    >
                      {item.getIcon(activeItem === index)}
                      {item.sidebarItem}
                    </span>
                  ) : (
                    <span
                      className={`
                        flex items-center p-3 ${
                          sidebarLeftIsVisible ? "justify-center" : "space-x-3"
                        } rounded-lg cursor-pointer ${
                        activeItem === index
                          ? "bg-gray-700 text-white"
                          : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                      } transition-all duration-200
                         `}
                    >
                      {item.getIcon(activeItem === index)}
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
