/**
 * Whether or not the app is running in development mode
 */
import ms from "ms";

export const isDev = process.env.NODE_ENV === "development";

export const MARKET_INTERVAL = ms("24 hours");
