const level = require("level");

const db = typeof window !== "undefined" ? level("user") : undefined;
export default db;
