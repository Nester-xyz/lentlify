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
    <nav className="flex-1 overflow-y-auto p-2 ">
      <ul className="space-y-0.5 w-full">
        {SidebarList.map((item, index) => {
          return (
            <li key={index}>
              <Link to={item.sidebarPath}>
                <div className={`flex items-center p-1 w-full`}>
                  {sidebarLeftIsVisible ? (
                    <span
                      className={` 
                        flex items-center p-3 gap-2 ${
                          !sidebarLeftIsVisible ? "justify-center" : "space-x-3"
                        } rounded-lg cursor-pointer ${
                        activeItem === index
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:bg-gray-700"
                      } transition-all duration-200  w-full
                        `}
                    >
                      {item.sidebarIcon}
                      {item.sidebarItem}
                    </span>
                  ) : (
                    <span
                      className={`
                        flex items-center p-3 ${
                          sidebarLeftIsVisible ? "justify-center" : "space-x-3"
                        } rounded-lg cursor-pointer ${
                        activeItem === index
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:bg-gray-700"
                      } transition-all duration-200
                         `}
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
