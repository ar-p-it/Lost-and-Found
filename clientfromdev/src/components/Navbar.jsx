import { useSelector } from "react-redux";

const RedditNavbar = () => {
  const user = useSelector((store) => store.user);

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

        <img
          src={user?.photoUrl || "https://i.pravatar.cc/32"}
          alt="profile"
          className="w-8 h-8 rounded-full cursor-pointer border border-slate-700"
        />
      </div>
    </nav>
  );
};

export default RedditNavbar;
