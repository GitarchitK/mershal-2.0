import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from './entrypoint_DyBXsGEz.mjs';
import { $ as $$Layout, a as $$Header, b as $$Footer, c as $$BottomNav } from './BottomNav_DYxqbQ9l.mjs';
import { a as adminDb } from './firebase-admin_Ckr6VjLr.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  let article = null;
  let relatedArticles = [];
  if (adminDb && slug) {
    try {
      const snapshot = await adminDb.collection("posts").where("slug", "==", slug).where("status", "==", "published").limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        article = { id: doc.id, ...doc.data() };
        const relatedSnapshot = await adminDb.collection("posts").where("category", "==", article.category).where("status", "==", "published").limit(4).get();
        relatedArticles = relatedSnapshot.docs.filter((d) => d.id !== doc.id).map((d) => ({ id: d.id, ...d.data() }));
      }
    } catch (error) {
      console.error("Error fetching article:", error);
    }
  }
  if (!article) {
    return Astro2.redirect("/404");
  }
  const publishedDate = article.publishedAt?.toDate?.() || /* @__PURE__ */ new Date();
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": article.seoTitle || article.title, "description": article.seoDescription || article.excerpt }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="container mx-auto px-4 py-6 pb-20 md:pb-6"> <article class="max-w-4xl mx-auto"> <div class="mb-4"> <span class="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-md shadow-md inline-block"> ${article.category} </span> </div> <h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"> ${article.title} </h1> <div class="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b-2 border-gray-200"> <div class="flex items-center gap-2"> <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path> </svg> <span class="font-semibold">${article.author}</span> </div> <span>•</span> <div class="flex items-center gap-2"> <svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path> </svg> <span>${publishedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span> </div> <span>•</span> <span>${article.readingTime} min read</span> </div> <img${addAttribute(article.featuredImage, "src")}${addAttribute(article.title, "alt")} class="w-full rounded-xl mb-8 shadow-lg"> <div class="bg-gray-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg"> <p class="text-xl text-gray-800 font-medium leading-relaxed">${article.excerpt}</p> </div> <div class="prose prose-lg max-w-none mb-8"> <div class="text-gray-800 leading-relaxed">${unescapeHTML(article.content)}</div> </div> <div class="flex flex-wrap gap-2 mb-8 pb-8 border-b-2 border-gray-200"> ${article.tags?.map((tag) => renderTemplate`<span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
#${tag} </span>`)} </div> ${relatedArticles.length > 0 && renderTemplate`<section> <h2 class="text-3xl font-bold mb-6 flex items-center"> <span class="w-1.5 h-10 bg-red-600 mr-4"></span>
Related News
</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> ${relatedArticles.map((related) => renderTemplate`<a${addAttribute(`/news/${related.slug}`, "href")} class="flex gap-4 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"> <img${addAttribute(related.featuredImage, "src")}${addAttribute(related.title, "alt")} class="w-40 h-40 object-cover"> <div class="flex-1 p-4"> <span class="text-xs font-bold text-red-600 uppercase">${related.category}</span> <h3 class="font-bold text-gray-900 line-clamp-2 mt-2 hover:text-red-600 transition">${related.title}</h3> </div> </a>`)} </div> </section>`} </article> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderComponent($$result2, "BottomNav", $$BottomNav, {})} ` })}`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/news/[slug].astro", void 0);

const $$file = "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/news/[slug].astro";
const $$url = "/news/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
