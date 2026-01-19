// import { createSlice } from "@reduxjs/toolkit";
// const feedSlice = createSlice({
//   name: "feed",
//   initialState: null,
//   reducers: {
//     addFeed: (state, action) => {
//       return action.payload;
//     },
//     removeFeed: (state, action) => null,
//   },
// });

// export const { addFeed } = feedSlice.actions;
// export default feedSlice.reducer;
 

import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    items: [],
    page: 1,
    hasMore: true,
  },
  reducers: {
    addFeed(state, action) {
      state.items.push(...action.payload);
    },
    incrementPage(state) {
      state.page += 1;
    },
    setHasMore(state, action) {
      state.hasMore = action.payload;
    },
    resetFeed(state) {
      state.items = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const { addFeed, incrementPage, setHasMore, resetFeed } =
  feedSlice.actions;

export default feedSlice.reducer;
