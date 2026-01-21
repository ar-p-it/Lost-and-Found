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
        { withCredentials: true },
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
          <div className="card bg-base-300 shadow-xl">
            <div className="card-body">
              <h2 className="card-title justify-center mb-4">Edit Profile</h2>

              <div className="space-y-3">
                {/* Username (readonly) */}
                <label className="form-control w-full">
                  <span className="label-text">Username</span>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="input input-bordered w-full bg-base-200"
                  />
                </label>

                {/* Email (readonly) */}
                <label className="form-control w-full">
                  <span className="label-text">Email</span>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input input-bordered w-full bg-base-200"
                  />
                </label>

                {/* Display Name */}
                <label className="form-control w-full">
                  <span className="label-text">Display Name</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                {/* Photo URL */}
                <label className="form-control w-full">
                  <span className="label-text">Photo URL</span>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </label>

                {/* Bio */}
                <label className="form-control w-full">
                  <span className="label-text">Bio</span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="textarea textarea-bordered w-full"
                    rows={4}
                  />
                  <span className="text-xs text-slate-400 mt-1">
                    {bio.length}/280
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-red-500 text-center mt-3">{error}</p>
              )}

              <div className="card-actions justify-center mt-4">
                <button
                  className="btn btn-primary w-full"
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
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            <span>Profile updated successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
