const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const threads = await pool.query(
      "SELECT id, user_id, title FROM thread LIMIT 5;",
    );
    console.log("Existing threads:");
    threads.rows.forEach((t) =>
      console.log(` - ${t.id} (${t.id.length} chars) - ${t.title}`),
    );
    await pool.end();
  } catch (e) {
    console.error("Error:", e.message);
    await pool.end();
  }
})();
