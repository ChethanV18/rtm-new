
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requirementRoutes = require("./routes/requirements");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/rtm_db", {
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/requirements", requirementRoutes);

app.listen(5000, () => console.log("Backend running on port 5000"));
