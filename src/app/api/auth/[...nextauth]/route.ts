import client from "@/app/utilis/db";
import NextAuth, { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { ObjectId } from "mongodb"; // Import ObjectId for MongoDB

const handler = NextAuth({
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
        const usersCollection = db.collection("users"); // Assuming 'users' is the collection name
        const user = await usersCollection.findOne({
          email: credentials.username,
        });

        if (!user) {
          return null;
        }

        // Add password verification logic (e.g., using bcrypt)
        // For demo, assuming password is correct
        return {
          id: user._id.toString(), // Convert ObjectId to string
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
    async signIn({ user, account, profile, credentials }) {
      if (account?.provider === "google") {
        const db = client.db();
        const usersCollection = db.collection("users");
        const existingUser = await usersCollection.findOne({
          email: profile.email,
        });

        if (existingUser) {
          return { ...user, id: existingUser._id.toString() }; // Return updated user object
        } else {
          // Create new user if not exists
          const newUser = await usersCollection.insertOne({
            name: profile.name,
            email: profile.email,
            image: profile.picture,
            createdAt: new Date(),
          });
          return { ...user, id: newUser.insertedId.toString() }; // Return new user with _id
        }
      }
      return true; // Proceed with sign-in for other providers
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub; // Map the _id from token (set by adapter)
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT strategy
  },
});

export { handler as GET, handler as POST };
