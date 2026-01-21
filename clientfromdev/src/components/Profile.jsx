import { useSelector } from "react-redux";

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-600">
        Please log in to view your profile.
      </div>
    );
  }

  const avatar =
    user?.photoUrl ||
    user?.avatarUrl ||
    user?.photoURL ||
    "/default-avatar.png";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <img
              src={avatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {user.displayName || user.username}
            </h1>
            <p className="text-sm text-slate-500">@{user.username}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Tokens</p>
            <p className="text-lg font-bold text-slate-900">
              {user.tokens ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Token Balance
            </p>
            <p className="text-lg font-bold text-slate-900">
              {user.tokenBalance ?? 0}
            </p>
          </div>
        </div>

        {user.bio && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-700">Bio</p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {user.bio}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500">Roles</p>
            <p className="mt-1">{(user.roles || []).join(", ") || "USER"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500">Status</p>
            <p className="mt-1">{user.isSuspended ? "Suspended" : "Active"}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-500">
          <div className="rounded-xl border border-slate-100 p-4">
            <p>Joined: {new Date(user.createdAt).toLocaleString()}</p>
            <p className="mt-1">
              Updated: {new Date(user.updatedAt).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4">
            <p>Last Active: {new Date(user.lastActiveAt).toLocaleString()}</p>
            <p className="mt-1">User ID: {user._id || user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
