import { getDb } from "./db/database.js";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 4000);

await getDb();

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
