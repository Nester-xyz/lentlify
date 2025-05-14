import { BrowserRouter } from "react-router-dom";
import GeneralLayout from "./layout";
import MainRoute from "./routes/mainRoute";
import { AuthProvider } from "./context/auth/AuthContext";
import { Web3Provider } from "./context/auth/Web3Provider";

import { SidebarProvider } from "./context/sidebar/SidebarProvider";

const App = () => {
  return (
    <div className="bg-black">
      <AuthProvider>
        <Web3Provider>
          <SidebarProvider>
            <BrowserRouter>
              <GeneralLayout>
                <MainRoute />
              </GeneralLayout>
            </BrowserRouter>
          </SidebarProvider>
        </Web3Provider>
      </AuthProvider>
    </div>
  );
};

export default App;
