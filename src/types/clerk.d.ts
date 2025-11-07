// TypeScript declarations for Clerk window object

interface ClerkSession {
  lastActiveToken?: {
    getRawString(): string;
  };
}

interface ClerkWindow {
  session?: ClerkSession;
}

declare global {
  interface Window {
    Clerk?: ClerkWindow;
  }
}

export {};


