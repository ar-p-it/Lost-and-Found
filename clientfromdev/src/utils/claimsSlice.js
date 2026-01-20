import { createSlice } from "@reduxjs/toolkit";

const claimsSlice = createSlice({
  name: "claims",
  initialState: {
    items: [],
  },
  reducers: {
    addClaim(state, action) {
      const claim = action.payload; // { id, post, createdAt, status }
      // avoid duplicates by postId
      const exists = state.items.some((c) => c.post?._id === claim.post?._id);
      if (!exists) state.items.push(claim);
    },
    withdrawByPostId(state, action) {
      const postId = action.payload;
      state.items = state.items.filter((c) => c.post?._id !== postId);
    },
    withdrawByClaimId(state, action) {
      const claimId = action.payload;
      state.items = state.items.filter((c) => c.id !== claimId);
    },
  },
});

export const { addClaim, withdrawByPostId, withdrawByClaimId } =
  claimsSlice.actions;

export default claimsSlice.reducer;
