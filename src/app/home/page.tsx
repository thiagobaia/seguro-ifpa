import { MobileDock } from "@/components/site-nav";
import { HomeFeed, type FeedPost } from "@/components/home-feed";
import { demoPosts } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  let posts: FeedPost[] = hasDatabase ? [] : demoPosts;
  if (hasDatabase) {
    const records = await prisma.bulletin.findMany({ where: { expiresAt: { gte: new Date() } }, orderBy: { createdAt: "desc" } });
    posts = records.map((item) => ({
      category: item.category,
      date: `${item.createdAt.getDate()} ${item.createdAt.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}`,
      title: item.title,
      description: item.description,
      validUntil: item.expiresAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
      image: item.imageUrl,
    }));
  }
  return <><HomeFeed posts={posts} /><MobileDock /></>;
}
