import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call the custom API for authentication
          const response = await fetch('http://localhost:5056/api/Users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.token) {
            // Decode JWT to get user info using Microsoft identity claims
            const payload = JSON.parse(atob(data.token.split('.')[1]));

            return {
              id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                  payload.nameid ||
                  payload.sub,
              name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                    payload.name ||
                    payload.unique_name,
              email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
                     payload.email,
              accessToken: data.token,
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? "";
        token.email = user.email ?? "";
        token.picture = user.image ?? "";
        // Store the custom API token
        if ('accessToken' in user) {
          token.accessToken = user.accessToken as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id ?? "";
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.image = token.picture ?? "";
        // Include the access token in the session
        if (token.accessToken) {
          session.accessToken = token.accessToken;
        }
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
