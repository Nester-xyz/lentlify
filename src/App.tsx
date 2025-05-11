import { BrowserRouter } from "react-router-dom";
import GeneralLayout from "./layout";
import MainRoute from "./routes/mainRoute";

const App = () => {
  return (
    <div className="bg-black">
      <BrowserRouter>
        <GeneralLayout>
          <MainRoute />
        </GeneralLayout>
      </BrowserRouter>
    </div>
  );
};

export default App;
