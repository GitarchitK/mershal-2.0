import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DyBXsGEz.mjs';
import { $ as $$Layout, a as $$Header, b as $$Footer, c as $$BottomNav } from './BottomNav_DYxqbQ9l.mjs';
import { a as adminDb } from './firebase-admin_Ckr6VjLr.mjs';

const prerender = false;
const $$category = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$category;
  const { category } = Astro2.params;
  const validCategories = ["sports", "technology", "business", "politics", "entertainment", "world", "ipl", "cricket"];
  if (!category || !validCategories.includes(category.toLowerCase())) {
    return Astro2.redirect("/404");
  }
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  let articles = [];
  if (adminDb) {
    try {
      const snapshot = await adminDb.collection("posts").where("category", "==", category).where("status", "==", "published").orderBy("publishedAt", "desc").limit(30).get();
      articles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": `${categoryName} News`, "description": `Latest ${categoryName} news and updates` }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="container mx-auto px-4 py-6 pb-20 md:pb-6"> <div class="mb-6"> <h1 class="text-3xl font-bold text-gray-900 flex items-center"> <span class="w-1.5 h-10 bg-red-600 mr-4"></span> ${categoryName} News
</h1> </div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${articles.map((article) => renderTemplate`<a${addAttribute(`/news/${article.slug}`, "href")} class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"> <img${addAttribute(article.featuredImage, "src")}${addAttribute(article.title, "alt")} class="w-full h-48 object-cover"> <div class="p-4"> <span class="text-xs font-bold text-red-600 uppercase">${article.category}</span> <h2 class="font-bold text-gray-900 mt-2 mb-2 line-clamp-2 hover:text-red-600 transition"> ${article.title} </h2> <p class="text-sm text-gray-600 line-clamp-2">${article.excerpt}</p> <div class="mt-3 text-xs text-gray-500"> ${article.readingTime} min read
</div> </div> </a>`)} </div> ${articles.length === 0 && renderTemplate`<div class="text-center py-16 bg-gray-50 rounded-lg"> <p class="text-gray-600 text-lg">No articles found in this category.</p> <a href="/" class="text-red-600 hover:text-red-700 font-semibold mt-4 inline-block">
← Back to Home
</a> </div>`} </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderComponent($$result2, "BottomNav", $$BottomNav, {})} ` })}`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/category/[category].astro", void 0);

const $$file = "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/category/[category].astro";
const $$url = "/category/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$category,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
