import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        username: { label: "Username", type: "text", placeholder: "student" },
        password: { label: "Password", type: "password", placeholder: "Any password works for demo" }
      },
      async authorize(credentials) {
        // For the hackathon demo, we accept any username and instantly log them in.
        // This proves NextAuth is integrated without needing a complex user database.
        if (credentials?.username) {
          return { 
            id: "1", 
            name: credentials.username, 
            email: `${credentials.username}@learnsphere.ai` 
          };
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    // We use the default NextAuth login page for speed!
  }
});

export { handler as GET, handler as POST };