// components/AppLayout.jsx
import { Outlet } from "react-router-dom";
import RedditNavbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useEffect } from "react";

import { addUser } from "../utils/userSlice";

// import CreatePostPage from "../pages/CreatePostPage";

// <Routes>
//   {/* Public */}
//   <Route path="/" element={<Starter />} />

//   {/* App layout */}
//   <Route element={<AppLayout />}>
//     <Route path="/feed" element={<Feed />} />
//     {/* <Route path="/create" element={<CreatePostPage />} /> */}
//   </Route>
// </Routes>

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  // console.log(user);

  const fetchUser = async () => {
    try {
      const user = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });
      dispatch(addUser(user.data));
    } catch (err) {
      if (err.status === 401) {
        // navigate("/");
        navigate("/", { replace: true });
      }
      console.log(err);
      // throw new Error(" Error " + err);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <RedditNavbar />
      <div className="flex min-h-[calc(100vh-56px)] bg-gray-50">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AppLayout;
