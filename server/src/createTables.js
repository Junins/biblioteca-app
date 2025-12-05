const db = require("./db");

async function run() {
  const hasUsers = await db.schema.hasTable("users");
  if (!hasUsers) {
    await db.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.string("username").unique();
      table.string("email");
      table.string("password_hash");
      table.string("role").defaultTo("user");
    });
  }

  const hasItems = await db.schema.hasTable("items");
  if (!hasItems) {
    await db.schema.createTable("items", (table) => {
      table.increments("id").primary();
      table.string("name");
      table.string("description");
      table.integer("owner_id");
    });
  }

  console.log("Tabelas criadas.");
  process.exit();
}

run();
