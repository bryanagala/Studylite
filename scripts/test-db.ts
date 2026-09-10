import postgres from "postgres";

const urls = [
  "postgres://studylite:studylite@127.0.0.1:5432/studylite",
  "postgres://studylite:studylite@localhost:5432/studylite",
];

for (const url of urls) {
  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql`select current_user as user, current_database() as db`;
    console.log("OK", url, rows[0]);
  } catch (error) {
    console.error("FAIL", url, error instanceof Error ? error.message : error);
  } finally {
    await sql.end({ timeout: 1 });
  }
}
