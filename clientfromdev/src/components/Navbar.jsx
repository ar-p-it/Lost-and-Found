import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
const RedditNavbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/", { replace: true });
    } catch (err) {
      throw new Error(" " + err);
    }
  };
  return (
    <nav className="h-14 w-full bg-slate-900 flex items-center px-4 text-slate-100">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-[150px]">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold"></div>
        <span className="text-xl font-semibold tracking-wide">
          (Lost:Found)
        </span>
      </div>

      {/* Center */}
      <div className="flex-1 flex justify-center items-center gap-2">
        <input
          type="text"
          placeholder="Search hubs,location"
          className="w-full max-w-[420px] bg-slate-800 text-slate-100 
                     placeholder-slate-400 rounded-full py-2 px-4 
                     outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          className="bg-indigo-600 hover:bg-indigo-500 
                           text-white px-4 py-2 rounded-full 
                           font-medium transition"
        >
          Ask
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        <button className="hover:bg-slate-800 px-3 py-1 rounded-md transition">
          Create
        </button>

        <button className="hover:bg-slate-800 p-2 rounded-full transition">
          🔔
        </button>

        {/* <img
          src={user?.photoUrl || "https://i.pravatar.cc/32"}
          alt="profile"
          className="w-8 h-8 rounded-full cursor-pointer border border-slate-700"
        /> */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost gap-2
            hover:bg-purple-100
            transition-colors
            ring-2 ring-purple-300
            rounded-full px-2"
          >
            {/* Profile Image */}
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user?.photoUrl || user?.photoURL || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Welcome text */}
            {user && (
              <span className="font-medium text-purple-800">
                Welcome {user.firstName}
              </span>
            )}
          </div>

          {/* USER DROPDOWN MENU */}
          <ul
            tabIndex={-1}
            className="menu menu-sm dropdown-content
            bg-gradient-to-br from-purple-50 to-pink-50
            text-gray-800
            rounded-xl
            z-50
            mt-3
            w-52
            p-2
            shadow-2xl
            border border-purple-200"
          >
            <li>
              <Link
                to="/profile"
                className="rounded-lg hover:bg-purple-100 font-medium"
              >
                Profile
              </Link>
            </li>{" "}
            <li>
              <Link
                to="/requests"
                className="rounded-lg hover:bg-purple-100 font-medium"
              >
                Requests
              </Link>
            </li>
            <li>
              <Link
                to="/connections"
                className="rounded-lg hover:bg-purple-100 font-medium"
              >
                Connections
              </Link>
            </li>
            <li>
              <a
                className="rounded-lg hover:bg-red-100 font-medium text-red-600"
                onClick={handleLogout}
              >
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default RedditNavbar;
