import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_DyBXsGEz.mjs';
import { $ as $$Layout, a as $$Header, b as $$Footer, c as $$BottomNav } from './BottomNav_DYxqbQ9l.mjs';
import { $ as $$NewsCard } from './NewsCard_Ds1DMRPI.mjs';
import { a as adminDb } from './firebase-admin_Ckr6VjLr.mjs';

const $$category = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$category;
  const { category } = Astro2.params;
  const validCategories = ["kolkata", "bangladesh", "videos", "live-tv", "sports", "technology", "photos", "business", "weather"];
  if (!validCategories.includes(category?.toLowerCase() || "")) {
    return Astro2.redirect("/404");
  }
  const categoryMap = {
    "kolkata": "Kolkata",
    "bangladesh": "Bangladesh",
    "videos": "Videos",
    "live-tv": "Live TV",
    "sports": "Sports",
    "technology": "Technology",
    "photos": "Photos",
    "business": "Business",
    "weather": "Weather"
  };
  const categoryName = categoryMap[category?.toLowerCase() || ""] || "News";
  const mockArticles = [
    {
      id: "1",
      title: `${categoryName} Breaking News: Major Development in the Region`,
      excerpt: "This is a sample news article for the category...",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      category: categoryName,
      publishedAt: /* @__PURE__ */ new Date()
    },
    {
      id: "2",
      title: `Latest Update from ${categoryName}: Important Announcement`,
      excerpt: "Another important news story from this category...",
      imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
      category: categoryName,
      publishedAt: /* @__PURE__ */ new Date()
    }
  ];
  let articles = mockArticles;
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("articles").where("category", "==", categoryName).orderBy("publishedAt", "desc").limit(20).get();
      if (!snapshot.empty) {
        articles = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
      }
    } catch (error) {
      console.warn("Using mock data - Firebase not configured:", error);
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": categoryName }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="container mx-auto px-4 py-6 pb-20 md:pb-6"> <div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900 flex items-center"> <span class="w-1.5 h-10 bg-red-600 mr-4"></span> ${categoryName} </h1> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${articles.map((article) => renderTemplate`${renderComponent($$result2, "NewsCard", $$NewsCard, { "id": article.id, "title": article.title, "imageUrl": article.imageUrl, "category": article.category })}`)} </div> ${articles.length === 0 && renderTemplate`<div class="text-center py-16 bg-gray-50 rounded-lg"> <p class="text-gray-600 text-lg">No articles found in this category.</p> <a href="/" class="text-red-600 hover:text-red-700 font-semibold mt-4 inline-block">
← Back to Home
</a> </div>`} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderComponent($$result2, "BottomNav", $$BottomNav, {})} ` })}`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/[category].astro", void 0);

const $$file = "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/[category].astro";
const $$url = "/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$category,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
