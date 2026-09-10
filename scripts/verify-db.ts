import "dotenv/config";
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("NO_DATABASE_URL");
    process.exit(1);
  }

  const host = (url.match(/@([^:/]+)/) || [])[1] || "unknown";
  console.log("Connecting to", host);

  const sql = postgres(url, {
    max: 1,
    connect_timeout: 20,
    ssl: host.includes("127.0.0.1") || host.includes("localhost") ? false : "require",
  });

  try {
    const profiles = await sql`select count(*)::int as n from profiles`;
    const subjects = await sql`select count(*)::int as n from subjects`;
    const questions = await sql`select count(*)::int as n from questions`;
    const demo = await sql`
      select email, onboarding_completed as onboarded, xp, level
      from profiles
      where email = 'demo@studylite.app'
      limit 1
    `;
    console.log(
      JSON.stringify(
        {
          ok: true,
          host,
          profiles: profiles[0].n,
          subjects: subjects[0].n,
          questions: questions[0].n,
          demo: demo[0] || null,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("CONNECT_OR_QUERY_FAILED");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
