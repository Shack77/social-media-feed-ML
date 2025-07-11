
// db.js
const { Pool } = require("pg");
const { Sequelize } = require('sequelize');

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "social_feed",
  password: "1234567", 
  port: 5432,
});


const sequelize = new Sequelize('social_feed', 'postges', '1234567', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;

=======
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;

