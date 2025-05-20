import { BrowserRouter } from "react-router-dom";
import GeneralLayout from "./layout";
import MainRoute from "./routes/mainRoute";
import { AuthProvider } from "./context/auth/AuthContext";
import { Web3Provider } from "./context/auth/Web3Provider";
import { SessionProvider } from "./context/session/sessionContext";
import { CampaignProvider } from "./context/campaign/CampaignProvider";

const App = () => {
  return (
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
  );
};

export default App;
