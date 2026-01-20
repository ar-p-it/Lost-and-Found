import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import feedReducer from "./feedSlice";
import claimsReducer from "./claimsSlice";
const appStore = configureStore({
  reducer: {
    user: userReducer,
    feed: feedReducer,
    claims: claimsReducer,
  },
});

export default appStore;
