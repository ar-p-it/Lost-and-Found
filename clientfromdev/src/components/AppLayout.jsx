// components/AppLayout.jsx
import { Outlet, useSearchParams } from "react-router-dom";
import RedditNavbar from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useEffect } from "react";

import { addUser } from "../utils/userSlice";

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store)=>store.user);
  
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
      <Outlet />
    </>
  );
};

export default AppLayout;
