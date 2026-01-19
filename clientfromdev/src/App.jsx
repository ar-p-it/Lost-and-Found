// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Starter from "./components/Starter";
// import RedditNavbar from "./components/Navbar";
// import { Provider } from "react-redux";
// import appStore from "./utils/appStore";
// function App() {
//   return (
//     <Provider store={appStore} >
//       <BrowserRouter>
//         <Routes>
//           <Route path="/" element={<Starter />} />

//           <Route path="/login" element={<div>Login</div>} />
//           <Route path="/test" element={<div>Test</div>} />
//           <Route path="/navbar" element={<RedditNavbar />} />
//         </Routes>
//       </BrowserRouter>
//     </Provider>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Starter from "./components/Starter";
import Feed from "./components/Feed";
import AppLayout from "./components/AppLayout";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>

          {/* Public Route */}
          <Route path="/" element={<Starter />} />

          {/* Protected Layout */}
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<Feed />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
