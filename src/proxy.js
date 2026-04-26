import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

// Указываем, какие пути защищать. Все, что начинается на /admin — под замком.
export const config = { 
  matcher: ["/admin/:path*"] 
};