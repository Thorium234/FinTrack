/*require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log("Database Connected");

    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();*/

import 'dotenv/config';
import app from './app.js';
import pool from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const connection = await pool.getConnection();
    console.log("Database Connected Successfully!");
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database Connection Failed:");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

