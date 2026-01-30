import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    {
      id: "etsy",
      name: "Etsy",
      type: "oauth",
      authorization: {
        url: "https://www.etsy.com/oauth/connect",
        params: {
          response_type: "code",
          scope: "transactions_r transactions_w listings_r listings_w shops_r shops_w",
          code_challenge_method: "S256",
        },
      },
      token: {
        url: "https://api.etsy.com/v3/public/oauth/token",
      },
      userinfo: {
        url: "https://openapi.etsy.com/v3/application/users/me",
        async request({ tokens }) {
          const response = await fetch("https://openapi.etsy.com/v3/application/users/me", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "x-api-key": process.env.ETSY_API_KEY!,
            },
          });
          return response.json();
        },
      },
      clientId: process.env.ETSY_API_KEY,
      clientSecret: process.env.ETSY_API_SECRET,
      profile(profile) {
        return {
          id: profile.user_id.toString(),
          name: profile.login_name,
          email: profile.primary_email,
        };
      },
    },
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === "etsy") {
        token.etsyAccessToken = account.access_token;
        token.etsyRefreshToken = account.refresh_token;
        token.etsyTokenExpires = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.etsyAccessToken = token.etsyAccessToken as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};

// Helper to get current session on server
export async function getCurrentUser() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  return session?.user;
}
