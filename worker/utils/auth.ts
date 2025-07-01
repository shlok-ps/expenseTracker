import { sign } from "jsonwebtoken";

let cachedToken: { [userId: string]: string | null } = {};
let tokenExpiry: { [userId: string]: number } = {}; // timestamp in ms

const ACCESS_SECRET = process.env.JWT_SECRET || 'access-secret'

export function getWorkerToken(userId: string): string {
  const now = Date.now();

  // If token is valid for at least 30 seconds, reuse it
  if (cachedToken[userId] && now < (tokenExpiry[userId] || 0) - 30_000) {
    return cachedToken[userId];
  }

  // Generate new token
  const expiresInSeconds = 180; // 3 mins
  const token = sign(
    { role: "worker", userId },
    ACCESS_SECRET,
    {
      subject: "worker-1",
      expiresIn: `${expiresInSeconds}s`,
    }
  );

  cachedToken[userId] = token;
  tokenExpiry[userId] = now + expiresInSeconds * 1000;
  return token;
}

function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const userId in tokenExpiry) {
    if (tokenExpiry[userId] < now) {
      delete cachedToken[userId];
      delete tokenExpiry[userId];
    }
  }
}

setInterval(cleanupExpiredTokens, 5 * 60 * 1000); // every 5 minutes

