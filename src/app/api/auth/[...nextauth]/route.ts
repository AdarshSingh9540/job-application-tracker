import client from "@/app/utilis/db";
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { ObjectId } from "mongodb";

export const authOptions = {
  adapter: MongoDBAdapter(client),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "email", type: "text", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const db = client.db();
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({
          email: credentials.username,
        });

        if (!user) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const db = client.db();
        const usersCollection = db.collection("users");
        const existingUser = await usersCollection.findOne({
          email: profile.email,
        });

        if (existingUser) {
          return { ...user, id: existingUser._id.toString() };
        } else {
          const newUser = await usersCollection.insertOne({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            createdAt: new Date(),
          });
          return { ...user, id: newUser.insertedId.toString() };
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
