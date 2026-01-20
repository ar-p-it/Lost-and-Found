const URI = "mongodb+srv://tanmaynarkar2907_db_user:7itkvyY51dHwy1Lt@cluster0.usqwodz.mongodb.net/Tanmay";

const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(URI);
};
module.exports = connectDB;

// JEUai6JpLj0xsxG3 // mainarpithoon_db_user module.exports = connectDB;
