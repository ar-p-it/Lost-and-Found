import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";
const Starter = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [emailId, setemailId] = useState("arpit@test.com");
  const [password, setpassword] = useState("Test@1234");
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const response = await axios.post(
        BASE_URL + "/login",
        {
          emailId,
          password,
        },
        {
          withCredentials: true,
        },
      );
      dispatch(addUser(response.data.user));
      // navigate("/");
      navigate("/feed");
      console.log(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative">
      {/* 🔹 Navbar */}
      <nav className="relative z-40 flex items-center justify-between px-8 py-4 bg-gray-950">
        <div className="text-2xl font-bold flex items-center gap-2">
          🔍 <span>Lost & Found</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm hover:text-gray-300"
          >
            Login
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* 🔹 Login Modal */}
      {showLogin && (
        <>
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/70 z-40"
            onClick={() => setShowLogin(false)}
          ></div>

          {/* Login Card */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-gray-900 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={emailId}
              onChange={(e) => setemailId(e.target.value)}
              className="w-full mb-3 px-4 py-2 rounded-md bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setpassword(e.target.value)}
              className="w-full mb-4 px-4 py-2 rounded-md bg-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              className="w-full bg-blue-600 py-2 rounded-md hover:bg-blue-700 transition  "
              onClick={handleLogin}
            >
              Login :{emailId}
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-200 block mx-auto"
            >
              Close
            </button>
          </div>
        </>
      )}

      {/* 🔹 Hero Section */}
      <section className="relative h-[calc(100vh-72px)] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 m-auto w-[90%] h-full object-cover opacity-85"
        >
          <source src="./v1.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 text-center px-6 max-w-3xl mt-auto pb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Lost & Found
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10">
            A community-powered platform to report, track, and recover lost
            items across trusted local hubs.
          </p>

          <div className="flex justify-center gap-6">
            <button className="px-8 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition">
              Report Lost
            </button>
            <button className="px-8 py-3 bg-orange-600 rounded-lg font-semibold hover:bg-orange-700 transition">
              Report Found
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Starter;
