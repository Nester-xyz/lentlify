import { BrowserRouter } from "react-router-dom";
import GeneralLayout from "./layout";
import MainRoute from "./routes/mainRoute";
import { AuthProvider } from "./context/auth/AuthContext";
import { Web3Provider } from "./context/auth/Web3Provider";
import { SessionProvider } from "./context/session/sessionContext";

const App = () => {
  return (
    <div className="bg-black">
      <SessionProvider>
        <AuthProvider>
          <Web3Provider>
            <BrowserRouter>
              <GeneralLayout>
                <MainRoute />
              </GeneralLayout>
            </BrowserRouter>
          </Web3Provider>
        </AuthProvider>
      </SessionProvider>
    </div>
  );
};

export default App;
