const SidebarLayout = () => {
  return (
    <div>
      <div className="flex flex-row h-screen">
        <div className="w-1/4 bg-gray-800 text-white p-4">
          {/* Sidebar content */}
          Sidebar
        </div>
        <div className="w-3/4 bg-gray-100 p-4">
          {/* Main content */}
          Main Content
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
