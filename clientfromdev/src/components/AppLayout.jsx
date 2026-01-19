// components/AppLayout.jsx
import { Outlet } from "react-router-dom";
import RedditNavbar from "./Navbar";

const AppLayout = () => {
  return (
    <>
      <RedditNavbar />
      <Outlet />
    </>
  );
};

export default AppLayout;
