import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { DefaultSession } from "next-auth";

// 扩展 Session 类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "QmJBzzN86SFfUw4MNRg6e3AngucQZhjMP/sOfvqeP6M=",
  providers: [
    CredentialsProvider({
      name: "Email Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (credentials.email !== adminEmail || credentials.password !== adminPassword) {
          throw new Error("Email or password is incorrect");
        }

        return {
          id: "admin",
          email: adminEmail,
          name: "Admin"
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      console.log('Session callback:', { session, token }); // 调试日志
      return session;
    },
    async jwt({ token, user }) {
      console.log('JWT callback:', { token, user }); // 调试日志
      return token;
    },
  }
};
