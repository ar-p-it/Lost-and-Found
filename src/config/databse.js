// const URI = "mongodb+srv://arpit:ty8NJcOQ6FGtn5BP@rubix.2surb5z.mongodb.net/Rigved";
// const URI = "mongodb+srv://arpit:ty8NJcOQ6FGtn5BP@rubix.2surb5z.mongodb.net/Rigved";
const URI = "mongodb+srv://tanmaynarkar2907_db_user:d0M2zxo1MWhffZ2S@lost.vszl8c7.mongodb.net/"
const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose.connect(URI);
};
module.exports = connectDB;

// JEUai6JpLj0xsxG3 // mainarpithoon_db_user module.exports = connectDB;
