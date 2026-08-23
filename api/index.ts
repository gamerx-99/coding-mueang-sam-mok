import { createApiApp } from "../server/app";

// Build the Express app
const app = createApiApp();

// Vercel's @vercel/node runtime natively supports Express instances as handlers.
export default app;
