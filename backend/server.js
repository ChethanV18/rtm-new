
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requirementRoutes = require("./routes/requirements");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/rtm_db";

mongoose.connect(MONGO_URI, {
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/requirements", requirementRoutes);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
