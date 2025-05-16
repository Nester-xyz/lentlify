import { BrowserRouter } from "react-router-dom";
import GeneralLayout from "./layout";
import MainRoute from "./routes/mainRoute";
import { AuthProvider } from "./context/auth/AuthContext";
import { Web3Provider } from "./context/auth/Web3Provider";
import { SessionProvider } from "./context/session/sessionContext";
import { CampaignProvider } from "./context/campaign/CampaignContext";

const App = () => {
  return (
    <div className="bg-black">
      <SessionProvider>
        <AuthProvider>
          <Web3Provider>
            <CampaignProvider>
              <BrowserRouter>
                <GeneralLayout>
                  <MainRoute />
                </GeneralLayout>
              </BrowserRouter>
            </CampaignProvider>
          </Web3Provider>
        </AuthProvider>
      </SessionProvider>
    </div>
  );
};

export default App;
