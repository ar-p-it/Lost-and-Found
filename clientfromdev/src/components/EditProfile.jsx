import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [displayName, setDisplayName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [bio, setBio] = useState("");

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Sync redux user → local state */
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoUrl(user.photoUrl || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const saveProfile = async () => {
    setError("");
    setShowToast(false);

    if (displayName.length > 80) {
      setError("Display name must be at most 80 characters.");
      return;
    }

    if (bio.length > 280) {
      setError("Bio must be at most 280 characters.");
      return;
    }

    try {
      setSaving(true);

      const res = await axios.patch(
        `${BASE_URL}/profile`,
        {
          displayName: displayName || undefined,
          photoUrl: photoUrl || undefined,
          bio: bio || undefined,
        },
        { withCredentials: true }
      );

      // resilient to backend response shape
      dispatch(addUser(res.data?.user || res.data?.data || res.data));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update profile.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center text-slate-600">
        Please log in to edit your profile.
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-start mt-10 px-4">
        <div className="w-full max-w-xl">
          {/* CHANGED: bg-white, text-black, added border for clean look */}
          <div className="card bg-white text-slate-900 dark:text-white shadow-xl border border-slate-200">
            <div className="card-body">
              <h2 className="card-title justify-center mb-4 text-2xl font-bold text-slate-900">
                Edit Profile
              </h2>

              <div className="space-y-4">
                {/* Username (readonly) */}
                <label className="form-control w-full">
                  <span className="label-text text-slate-900 font-medium">Username</span>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    // CHANGED: bg-slate-100 for disabled look
                    className="input input-bordered w-full bg-slate-100 text-slate-600 border-slate-300"
                  />
                </label>

                {/* Email (readonly) */}
                <label className="form-control w-full">
                  <span className="label-text text-slate-900 font-medium">Email</span>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input input-bordered w-full bg-slate-100 text-slate-600 border-slate-300"
                  />
                </label>

                {/* Display Name */}
                <label className="form-control w-full">
                  <span className="label-text text-slate-900 font-medium">Display Name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    // CHANGED: bg-white text-black
                    className="input input-bordered w-full bg-white text-slate-900 dark:text-white border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </label>

                {/* Photo URL */}
                <label className="form-control w-full">
                  <span className="label-text text-slate-900 font-medium">Photo URL</span>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="input input-bordered w-full bg-white text-slate-900 dark:text-white border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </label>

                {/* Bio */}
                <label className="form-control w-full">
                  <span className="label-text text-slate-900 font-medium">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="textarea textarea-bordered w-full bg-white text-slate-900 dark:text-white border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    rows={4}
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {bio.length}/280
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-red-600 dark:text-red-400 text-center mt-3 font-medium">
                  {error}
                </p>
              )}

              <div className="card-actions justify-center mt-6">
                <button
                  className="btn btn-primary w-full text-white"
                  disabled={saving}
                  onClick={saveProfile}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && !error && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success text-white shadow-lg">
            <span>Profile updated successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;