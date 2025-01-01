import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string; // Add accessToken to the session, make sure it's a string
  }

  interface JWT {
    accessToken?: string; // Make accessToken optional in the JWT type
  }
}
