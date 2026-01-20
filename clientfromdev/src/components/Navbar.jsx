import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
const RedditNavbar = () => {
  const user = useSelector((store) => store.user);
  // console.log(user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hubsOpen, setHubsOpen] = useState(false);
  const [hubs, setHubs] = useState([]);
  const [hubsLoading, setHubsLoading] = useState(false);
  const [hubsError, setHubsError] = useState("");
  const [hubSearchQuery, setHubSearchQuery] = useState("");
  const [hubsTitle, setHubsTitle] = useState("Your hubs");
  const [hubsMode, setHubsMode] = useState("joined");
  const [joinedHubIds, setJoinedHubIds] = useState(new Set());
  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/", { replace: true });
    } catch (err) {
      throw new Error(" " + err);
    }
  };

  const getUserLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 },
      );
    });

  const fetchHubs = async () => {
    try {
      setHubsError("");
      setHubsLoading(true);
      setHubsTitle("Your hubs");
      setHubsMode("joined");
      const loc = await getUserLocation();
      const params = loc
        ? { lat: loc.lat, lng: loc.lng, radiusMeters: 15000 }
        : { radiusMeters: 15000 };
      const res = await axios.get(`${BASE_URL}/hubs`, {
        params,
        withCredentials: true,
      });
      setHubs(res?.data?.data || []);
    } catch (err) {
      setHubsError("Failed to load hubs. Please try again.");
    } finally {
      setHubsLoading(false);
    }
  };

  const searchHubs = async () => {
    try {
      setHubsError("");
      setHubsLoading(true);
      setHubsTitle(`Results for "${hubSearchQuery.trim()}"`);
      setHubsMode("search");
      const res = await axios.get(`${BASE_URL}/hubs/search`, {
        params: { q: hubSearchQuery.trim() },
        withCredentials: true,
      });
      setHubs(res?.data?.data || []);
      setHubsOpen(true);
    } catch (err) {
      setHubsError("Failed to search hubs. Please try again.");
    } finally {
      setHubsLoading(false);
    }
  };

  const handleJoinHub = async (hubId) => {
    try {
      await axios.post(
        `${BASE_URL}/hubs/${hubId}/join`,
        {},
        { withCredentials: true },
      );
      setJoinedHubIds((prev) => new Set(prev).add(hubId));
    } catch (err) {
      setHubsError("Failed to join hub. Please try again.");
    }
  };

  const handleToggleHubs = async () => {
    const next = !hubsOpen;
    setHubsOpen(next);
    if (next && !hubsLoading) {
      await fetchHubs();
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              Lost &amp; Found
            </span>
          </div>

          {/* Center: Nav Links */}
          {/* <div className="hidden md:flex items-center gap-2">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Feed
            </Link>
            <Link
              to="/lost"
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Lost
            </Link>
            <Link
              to="/found"
              className="px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Found
            </Link>
          </div> */}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/feed"
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Feed
              </Link>
              <Link
                to="/lost"
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Lost
              </Link>
              <Link
                to="/found"
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Found
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
              <input
                type="text"
                value={hubSearchQuery}
                onChange={(e) => setHubSearchQuery(e.target.value)}
                placeholder="Search hubs"
                className="w-44 bg-transparent px-2 py-1 text-sm text-slate-700 placeholder-slate-400 outline-none"
              />
              <button
                onClick={searchHubs}
                disabled={!hubSearchQuery.trim()}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black transition disabled:opacity-50"
              >
                Search
              </button>
            </div>

            <Link
              to="/create"
              className="hidden sm:inline-flex items-center rounded-lg bg-slate-900 text-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-black transition"
            >
              Create
            </Link>

            <div className="relative hidden sm:inline-flex">
              <button
                onClick={handleToggleHubs}
                className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Hubs
              </button>
              {hubsOpen && (
                <div
                  className="absolute right-0 mt-2 w-[360px] max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl z-50"
                  onMouseLeave={() => setHubsOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      {hubsTitle}
                    </span>
                    <button
                      onClick={fetchHubs}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Refresh
                    </button>
                  </div>

                  {hubsLoading && (
                    <div className="px-4 py-6 text-sm text-slate-500 text-center">
                      Loading hubs…
                    </div>
                  )}

                  {hubsError && (
                    <div className="px-4 py-3 text-sm text-rose-600">
                      {hubsError}
                    </div>
                  )}

                  {!hubsLoading && hubs.length === 0 && !hubsError && (
                    <div className="px-4 py-6 text-sm text-slate-500 text-center">
                      No hubs found in this area.
                    </div>
                  )}

                  <div className="divide-y divide-slate-100">
                    {hubs.map((hub) => (
                      <div
                        key={hub._id}
                        className="px-4 py-3 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/hubs/${hub.slug}`}
                              onClick={() => setHubsOpen(false)}
                              className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition"
                            >
                              {hub.name}
                            </Link>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {hub.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            r/{hub.slug}
                          </p>
                          {hub.description && (
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                              {hub.description}
                              {hubsMode === "search" && (
                                <button
                                  onClick={() => handleJoinHub(hub._id)}
                                  disabled={joinedHubIds.has(hub._id)}
                                  className={`h-8 px-3 rounded-full text-xs font-semibold transition border ${
                                    joinedHubIds.has(hub._id)
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                                  } disabled:opacity-60`}
                                >
                                  {joinedHubIds.has(hub._id)
                                    ? "Joined"
                                    : "Join"}
                                </button>
                              )}
                            </p>
                          )}
                          {hub.rules && (
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              Rules: {hub.rules}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500 mt-1">
                            Members: {hub.memberCount || 0} • Radius:{" "}
                            {Math.round((hub.coverageRadiusMeters || 0) / 1000)}{" "}
                            km
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm hover:bg-slate-50 transition"
              >
                <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-indigo-200">
                  <img
                    src={
                      user?.photoUrl || user?.photoURL || "/default-avatar.png"
                    }
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="hidden sm:inline-block text-sm font-semibold text-slate-800">
                  {user ? user.username : "Login"}
                </span>
              </div>

              <ul
                tabIndex={-1}
                className="menu menu-sm dropdown-content bg-white text-slate-800 rounded-xl z-50 mt-3 w-52 p-2 shadow-xl border border-slate-200"
              >
                <li>
                  <Link
                    to="/profile"
                    className="rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/requests"
                    className="rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/connections"
                    className="rounded-lg hover:bg-slate-100 font-medium"
                  >
                    Connections
                  </Link>
                </li>
                <li>
                  <a
                    className="rounded-lg hover:bg-red-50 font-medium text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden pb-3 flex items-center gap-2">
          <Link
            to="/"
            className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Feed
          </Link>
          <button
            onClick={handleToggleHubs}
            className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Hubs
          </button>
          <Link
            to="/lost"
            className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Lost
          </Link>
          <Link
            to="/found"
            className="flex-1 text-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            Found
          </Link>
        </div>

        {hubsOpen && (
          <div className="md:hidden mb-4 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                {hubsTitle}
              </span>
              <button
                onClick={fetchHubs}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Refresh
              </button>
            </div>

            {hubsLoading && (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                Loading hubs…
              </div>
            )}

            {hubsError && (
              <div className="px-4 py-3 text-sm text-rose-600">{hubsError}</div>
            )}

            {!hubsLoading && hubs.length === 0 && !hubsError && (
              <div className="px-4 py-6 text-sm text-slate-500 text-center">
                No hubs found in this area.
              </div>
            )}

            <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto">
              {hubs.map((hub) => (
                <div key={hub._id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/hubs/${hub.slug}`}
                        onClick={() => setHubsOpen(false)}
                        className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {hub.name}
                      </Link>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {hub.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      r/{hub.slug}
                    </p>
                    {hub.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {hub.description}
                      </p>
                    )}
                    {hub.rules && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        Rules: {hub.rules}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Members: {hub.memberCount || 0} • Radius:{" "}
                      {Math.round((hub.coverageRadiusMeters || 0) / 1000)} km
                    </p>
                  </div>
                  {hubsMode === "search" && (
                    <button
                      onClick={() => handleJoinHub(hub._id)}
                      disabled={joinedHubIds.has(hub._id)}
                      className={`h-8 px-3 rounded-full text-xs font-semibold transition border ${
                        joinedHubIds.has(hub._id)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      } disabled:opacity-60`}
                    >
                      {joinedHubIds.has(hub._id) ? "Joined" : "Join"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RedditNavbar;
