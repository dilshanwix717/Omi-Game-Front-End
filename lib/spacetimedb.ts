// SpacetimeDB client initialization
// This will be updated once SpacetimeDB TypeScript bindings are generated

const SPACETIMEDB_URL =
  process.env.NEXT_PUBLIC_SPACETIMEDB_URL || "ws://localhost:3000";
const GAME_NAME = process.env.NEXT_PUBLIC_GAME_NAME || "omi-card-game";

export { SPACETIMEDB_URL, GAME_NAME };
