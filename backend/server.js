
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const requirementRoutes = require("./routes/requirements");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rtm_db";

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

pool.connect()
    .then(() => {
        console.log("PostgreSQL Connected");

        // Create table if it doesn't exist
        return pool.query(`
      CREATE TABLE IF NOT EXISTS requirements (
        id SERIAL PRIMARY KEY,
        requirement_id VARCHAR(255) UNIQUE,
        description TEXT,
        development VARCHAR(50) DEFAULT 'Pending',
        testing VARCHAR(50) DEFAULT 'Pending',
        reporting VARCHAR(50) DEFAULT 'Pending',
        deployment VARCHAR(50) DEFAULT 'Pending',
        usage VARCHAR(50) DEFAULT 'Pending',
        status VARCHAR(50) DEFAULT 'Not Started',
        remarks TEXT DEFAULT ''
      )
    `);
    })
    .then(() => console.log("Requirements table ready"))
    .catch(err => console.error("Database connection error", err));

// Pass the pool to the routes
app.use("/requirements", (req, res, next) => {
    req.pool = pool;
    next();
}, requirementRoutes);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
