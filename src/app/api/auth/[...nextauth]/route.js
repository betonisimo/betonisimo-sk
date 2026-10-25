import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Login", type: "text" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        // ПРОВЕРКА: Данные берутся из .env файла
        const adminUser = process.env.ADMIN_USER;
        const adminPass = process.env.ADMIN_PASS;

        if (
          adminUser && adminPass &&
          credentials?.username === adminUser &&
          credentials?.password === adminPass
        ) {
          return { id: "1", name: "Admin" };
        }
        return null; // Если неверно — доступ запрещен
      }
    })
  ],
  pages: {
    signIn: "/auth/signin", // Своя страница входа
  },
  session: {
    strategy: "jwt", // Быстрая проверка через токены
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
