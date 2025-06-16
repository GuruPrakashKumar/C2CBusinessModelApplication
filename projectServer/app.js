/* 

================== Most Important ==================
* Issue 1 :
In uploads folder you need create 3 folder like bellow.
Folder structure will be like: 
public -> uploads -> 1. products 2. customize 3. categories
*** Now This folder will automatically create when we run the server file

* Issue 2:
For admin signup just go to the auth 
controller then newUser obj, you will 
find a role field. role:1 for admin signup & 
role: 0 or by default it for customer signup.
go user model and see the role field.

*/

const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import Router
const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email")
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const brainTreeRouter = require("./routes/braintree");
const razorpayRouter = require("./routes/razorpay");
const orderRouter = require("./routes/orders");
const bidRouter = require("./routes/bids");
const bankDetailRouter = require("./routes/sellerBank")
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
const blogRouter = require("./routes/blog")
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");
const axios = require('axios');
const pingInterval = 1 * 60 * 1000; // 1 minutes
/* Create All Uploads Folder if not exists | For Uploading Images */
CreateAllFolder();

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!"));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api", brainTreeRouter);
app.use("/api", razorpayRouter);
app.use("/api/order", orderRouter);
app.use("/api/bid", bidRouter);
app.use("/api/seller-bank", bankDetailRouter);
app.use("/api/customize", customizeRouter);
app.use("/email", emailRouter)
app.use("/api/blog", blogRouter)

//to keep server alive
const pingSelf = async () => {
  try {
    await axios.get(`${process.env.SERVER_URL}/health-check`);
    // await axios.get('http://localhost:8000/health-check');
  } catch (error) {
    console.error('Self-ping failed:', error.message);
  }
};

// Start the interval
setInterval(pingSelf, pingInterval);

app.get('/health-check', (req, res) => {
  res.status(200).send('OK');
});
// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
