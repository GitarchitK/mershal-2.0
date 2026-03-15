import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DyBXsGEz.mjs';
import { g as getCurrentWeather, d as getWeatherEmoji, $ as $$Layout, a as $$Header, b as $$Footer, c as $$BottomNav } from './BottomNav_DYxqbQ9l.mjs';
import { a as adminDb } from './firebase-admin_Ckr6VjLr.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  let articles = [];
  let errorMessage = "";
  if (adminDb) {
    try {
      console.log("Fetching articles from Firestore...");
      const snapshot = await adminDb.collection("posts").where("status", "==", "published").orderBy("publishedAt", "desc").limit(20).get();
      console.log("Articles found:", snapshot.size);
      articles = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Article:", doc.id, data.title);
        return {
          id: doc.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          featuredImage: data.featuredImage,
          category: data.category,
          publishedAt: data.publishedAt
        };
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      errorMessage = error instanceof Error ? error.message : "Failed to load articles";
    }
  } else {
    console.warn("Firebase Admin not initialized");
    errorMessage = "Firebase not configured";
  }
  const weatherData = await getCurrentWeather("Kolkata");
  const weather = {
    city: weatherData?.location.name || "Kolkata",
    country: weatherData?.location.country || "India",
    temp: weatherData?.current.temp_c || 25,
    condition: weatherData?.current.condition.text || "Partly Cloudy",
    emoji: weatherData ? getWeatherEmoji(weatherData.current.condition.text) : "⛅",
    humidity: weatherData?.current.humidity || 65,
    wind: weatherData?.current.wind_kph || 12
  };
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Home" }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="container mx-auto px-4 py-6 pb-20 md:pb-6"> <!-- Featured News --> ${articles.length > 0 && renderTemplate`<div class="mb-8"> <a${addAttribute(`/news/${articles[0].slug}`, "href")} class="block"> <div class="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all"> <img${addAttribute(articles[0].featuredImage, "src")}${addAttribute(articles[0].title, "alt")} class="w-full h-96 object-cover"> <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div> <div class="absolute bottom-0 left-0 right-0 p-8"> <span class="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-md shadow-md inline-block mb-4"> ${articles[0].category} </span> <h2 class="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight"> ${articles[0].title} </h2> <p class="text-gray-200 text-lg line-clamp-2"> ${articles[0].excerpt} </p> </div> </div> </a> </div>`} <!-- Latest News Section --> <div class="mb-6"> <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center"> <span class="w-1 h-8 bg-red-600 mr-3"></span>
Latest News
</h2> </div> <!-- News Grid --> ${articles.length > 1 ? renderTemplate`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> ${articles.slice(1).map((article) => renderTemplate`<a${addAttribute(`/news/${article.slug}`, "href")} class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"> <img${addAttribute(article.featuredImage, "src")}${addAttribute(article.title, "alt")} class="w-full h-48 object-cover"> <div class="p-4"> <span class="text-xs font-bold text-red-600 uppercase">${article.category}</span> <h3 class="font-bold text-gray-900 mt-2 mb-2 line-clamp-2 hover:text-red-600 transition"> ${article.title} </h3> <p class="text-sm text-gray-600 line-clamp-2">${article.excerpt}</p> </div> </a>`)} </div>` : articles.length === 0 ? renderTemplate`<div class="text-center py-16 bg-gray-50 rounded-lg mb-8"> <div class="text-6xl mb-4">📰</div> <h3 class="text-2xl font-bold text-gray-900 mb-2">No Articles Yet</h3> <p class="text-gray-600 mb-4">Articles will appear here once the automation system publishes them.</p> ${errorMessage && renderTemplate`<p class="text-sm text-red-600 mb-2">Error: ${errorMessage}</p>`} <p class="text-sm text-gray-500">Run: <code class="bg-gray-200 px-2 py-1 rounded">npm run publish</code> to create your first article</p> </div>` : null} <!-- Weather Widget --> <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 mb-8 text-white"> <div class="flex items-center justify-between"> <div> <p class="text-sm opacity-90 mb-1">${weather.city}, ${weather.country}</p> <p class="text-5xl font-bold">${weather.temp}°C</p> <p class="text-sm opacity-90 mt-2">${weather.condition}</p> </div> <div class="text-right"> <div class="text-6xl mb-2">${weather.emoji}</div> <p class="text-sm opacity-90">Humidity: ${weather.humidity}%</p> <p class="text-sm opacity-90">Wind: ${weather.wind} km/h</p> </div> </div> </div> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderComponent($$result2, "BottomNav", $$BottomNav, {})} ` })}`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/index.astro", void 0);

const $$file = "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
