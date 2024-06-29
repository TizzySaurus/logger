const { Pool } = require('pg')

require('dotenv').config()

const pool = new Pool({
  user: process.env.PGUSER, // Make sure PGUSER is a superuser
  host: process.env.PGHOST,
  database: 'template1', // Should exist in all postgres databases by default
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ?? 5432
})

pool.on('error', e => {
  console.error('There was an error while generating the database structure!', e)
})

async function generate () {
  await pool.query(`CREATE DATABASE ${process.env.PGDATABASE || 'logger'}`) // create db
  const loggerDB = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE || 'logger',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT ?? 5432
  })
  // Only create these if it doesn't exist already. 
  await loggerDB.query('CREATE TABLE IF NOT EXISTS messages ( id TEXT PRIMARY KEY, author_id TEXT NOT NULL, content TEXT, attachment_b64 TEXT, ts TIMESTAMPTZ )') // establish messages table
  await loggerDB.query('CREATE TABLE IF NOT EXISTS guilds ( id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, ignored_channels TEXT[], disabled_events TEXT[], event_logs JSON, log_bots BOOL, custom_settings JSON )') // establish guilds table
  console.log('DB Generated!')
}

generate()
