import { prisma } from "@/lib/prisma";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import Services from "@/components/home/Services";
import Reviews from "@/components/home/Reviews";
import { getContent, getCollections } from "@/actions/adminActions"; 
import StyleGrid from "@/components/home/StyleGrid";
import PortfolioPreview from "@/components/home/PortfolioPreview";
import { getSeo, getSeoMany, pageMetadata, seoSection } from "@/lib/seo";

export const revalidate = 3600; 
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const seo = await getSeo("page", "home");
  return pageMetadata(seo, {
    title: "BETONISSIMO - Betónové ploty a záhradné doplnky | Kvalita a dizajn pre váš domov",
    description: "Zabezpečujeme predaj a profesionálnu montáž betónových plotov po celom Slovensku. Tradičná kvalita, moderný dizajn.",
    path: "/",
  });
}

export default async function Home() {
  const recentProjects = await prisma.project.findMany({ 
    take: 6, 
    orderBy: { createdAt: 'desc' } 
  });
  const projectSeo = await getSeoMany("project", recentProjects.map((project) => project.id));
  const projectsWithSeo = recentProjects.map((project) => ({ ...project, seo: projectSeo.get(seoSection("project", project.id)) || {} }));
  const collections = await getCollections();
  const aboutData = await getContent("domov", "domov-o-nas");
  const servicesData = await getContent("domov", "domov-sluzby");
  const reviewsData = await getContent("domov", "domov-recenzie");
  
  // Получаем одобренные отзывы
  const approvedReviews = await prisma.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main>
      <Hero />
      <StyleGrid collections={collections} limit={8}/>
      <PortfolioPreview projects={projectsWithSeo} />
      <About editMode={false} dbData={aboutData || undefined} />
      <Services editMode={false} dbData={servicesData || undefined} />
      <Reviews 
        editMode={false} 
        dbData={reviewsData || undefined}
        approvedReviews={approvedReviews} 
      />
    </main>
  );
}
