import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_DyBXsGEz.mjs';
import { $ as $$Layout, a as $$Header, b as $$Footer, c as $$BottomNav } from './BottomNav_DYxqbQ9l.mjs';
import { $ as $$NewsCard } from './NewsCard_Ds1DMRPI.mjs';

const prerender = false;
const $$Ipl = createComponent(($$result, $$props, $$slots) => {
  const iplNews = [
    {
      id: "ipl-1",
      title: "KKR vs MI: Knight Riders Secure Thrilling Victory in Last-Ball Finish",
      imageUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800",
      category: "IPL",
      featured: true
    },
    {
      id: "ipl-2",
      title: "Virat Kohli Smashes Magnificent Century Against CSK",
      imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800",
      category: "IPL"
    },
    {
      id: "ipl-3",
      title: "Rohit Sharma Masterclass: 85 Off 43 Balls Powers MI to Victory",
      imageUrl: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800",
      category: "IPL"
    },
    {
      id: "ipl-4",
      title: "Young Bowler Takes 5 Wickets in Debut Match",
      imageUrl: "https://images.unsplash.com/photo-1593766787879-e8c78e09cec5?w=800",
      category: "IPL"
    },
    {
      id: "ipl-5",
      title: "IPL 2026 Points Table: Race for Playoffs Intensifies",
      imageUrl: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=800",
      category: "IPL"
    },
    {
      id: "ipl-6",
      title: "Record-Breaking Partnership: 250 Runs in 18 Overs",
      imageUrl: "https://images.unsplash.com/photo-1512719994953-eabf50895df7?w=800",
      category: "IPL"
    }
  ];
  const pointsTable = [
    { position: 1, team: "KKR", matches: 14, won: 10, lost: 4, points: 20, nrr: "+0.85" },
    { position: 2, team: "RCB", matches: 14, won: 9, lost: 5, points: 18, nrr: "+0.62" },
    { position: 3, team: "MI", matches: 14, won: 9, lost: 5, points: 18, nrr: "+0.45" },
    { position: 4, team: "CSK", matches: 14, won: 8, lost: 6, points: 16, nrr: "+0.28" },
    { position: 5, team: "DC", matches: 14, won: 7, lost: 7, points: 14, nrr: "-0.15" },
    { position: 6, team: "RR", matches: 14, won: 6, lost: 8, points: 12, nrr: "-0.32" },
    { position: 7, team: "PBKS", matches: 14, won: 5, lost: 9, points: 10, nrr: "-0.58" },
    { position: 8, team: "SRH", matches: 14, won: 4, lost: 10, points: 8, nrr: "-0.75" }
  ];
  const upcomingMatches = [
    { team1: "KKR", team2: "MI", date: "March 16, 2026", time: "7:30 PM IST", venue: "Eden Gardens, Kolkata" },
    { team1: "RCB", team2: "CSK", date: "March 17, 2026", time: "3:30 PM IST", venue: "M. Chinnaswamy Stadium, Bangalore" },
    { team1: "DC", team2: "RR", date: "March 17, 2026", time: "7:30 PM IST", venue: "Arun Jaitley Stadium, Delhi" },
    { team1: "PBKS", team2: "SRH", date: "March 18, 2026", time: "7:30 PM IST", venue: "PCA Stadium, Mohali" }
  ];
  const stats = [
    { label: "Matches Played", value: "74" },
    { label: "Teams", value: "8" },
    { label: "Sixes Hit", value: "250+" },
    { label: "Status", value: "Live" }
  ];
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "IPL 2026", "description": "Follow IPL 2026 Season 19 - Live scores, points table, news, and match updates" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Header", $$Header, {})} ${maybeRenderHead()}<main class="container mx-auto px-4 py-6 pb-20 md:pb-6"> <!-- Hero Banner --> <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 md:p-12 mb-8 text-white"> <div class="text-center"> <div class="text-5xl md:text-6xl mb-4">🏏</div> <h1 class="text-4xl md:text-6xl font-black mb-3">IPL 2026</h1> <p class="text-xl md:text-2xl font-semibold opacity-90">Season 19 • Live Now</p> </div> </div> <!-- Quick Stats --> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"> ${stats.map((stat) => renderTemplate`<div class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"> <p class="text-3xl md:text-4xl font-bold text-red-600 mb-2">${stat.value}</p> <p class="text-gray-600 font-semibold">${stat.label}</p> </div>`)} </div> <!-- Points Table --> <section class="mb-8"> <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center"> <span class="w-1 h-8 bg-red-600 mr-3"></span>
IPL 2026 Points Table
</h2> <div class="bg-white rounded-lg shadow-lg overflow-hidden"> <div class="overflow-x-auto"> <table class="w-full"> <thead class="bg-red-600 text-white"> <tr> <th class="px-4 py-3 text-left text-sm font-bold">Pos</th> <th class="px-4 py-3 text-left text-sm font-bold">Team</th> <th class="px-4 py-3 text-center text-sm font-bold">M</th> <th class="px-4 py-3 text-center text-sm font-bold">W</th> <th class="px-4 py-3 text-center text-sm font-bold">L</th> <th class="px-4 py-3 text-center text-sm font-bold">Pts</th> <th class="px-4 py-3 text-center text-sm font-bold">NRR</th> </tr> </thead> <tbody> ${pointsTable.map((team) => renderTemplate`<tr${addAttribute(`border-b hover:bg-gray-50 transition-colors ${team.position <= 4 ? "bg-green-50" : ""}`, "class")}> <td class="px-4 py-3 font-semibold text-gray-900">${team.position}</td> <td class="px-4 py-3 font-bold text-gray-900">${team.team}</td> <td class="px-4 py-3 text-center text-gray-700">${team.matches}</td> <td class="px-4 py-3 text-center text-gray-700">${team.won}</td> <td class="px-4 py-3 text-center text-gray-700">${team.lost}</td> <td class="px-4 py-3 text-center font-bold text-gray-900">${team.points}</td> <td${addAttribute(`px-4 py-3 text-center font-semibold ${team.nrr.startsWith("+") ? "text-green-600" : "text-red-600"}`, "class")}> ${team.nrr} </td> </tr>`)} </tbody> </table> </div> <div class="bg-gray-50 px-4 py-3 text-sm text-gray-600 border-t"> <span class="inline-block w-3 h-3 bg-green-200 rounded mr-2"></span>
Top 4 teams qualify for playoffs
</div> </div> </section> <!-- Latest IPL News --> <section class="mb-8"> <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center"> <span class="w-1 h-8 bg-red-600 mr-3"></span>
Latest IPL News
</h2> <!-- Featured Article --> ${iplNews.length > 0 && renderTemplate`<div class="mb-6"> ${renderComponent($$result2, "NewsCard", $$NewsCard, { "id": iplNews[0].id, "title": iplNews[0].title, "imageUrl": iplNews[0].imageUrl, "category": iplNews[0].category, "featured": true })} </div>`} <!-- News Grid --> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> ${iplNews.slice(1).map((article) => renderTemplate`${renderComponent($$result2, "NewsCard", $$NewsCard, { "id": article.id, "title": article.title, "imageUrl": article.imageUrl, "category": article.category })}`)} </div> </section> <!-- Upcoming Matches --> <section class="mb-8"> <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4 flex items-center"> <span class="w-1 h-8 bg-red-600 mr-3"></span>
Upcoming Matches
</h2> <div class="grid grid-cols-1 md:grid-cols-2 gap-6"> ${upcomingMatches.map((match) => renderTemplate`<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"> <div class="flex items-center justify-between mb-4"> <div class="text-center flex-1"> <p class="text-2xl font-black text-gray-900">${match.team1}</p> </div> <div class="px-4"> <span class="text-red-600 font-bold text-xl">VS</span> </div> <div class="text-center flex-1"> <p class="text-2xl font-black text-gray-900">${match.team2}</p> </div> </div> <div class="border-t pt-4 space-y-2"> <p class="text-sm text-gray-600 flex items-center justify-center"> <span class="mr-2">📅</span> ${match.date} • ${match.time} </p> <p class="text-sm text-gray-600 flex items-center justify-center"> <span class="mr-2">📍</span> ${match.venue} </p> </div> </div>`)} </div> </section> <!-- Advertisement Section --> <section class="mb-8"> <div class="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-12 text-center text-white"> <p class="text-2xl font-bold mb-2">IPL 2026 Official Sponsors</p> <p class="text-lg opacity-90">Advertisement Space</p> </div> </section> </main> ${renderComponent($$result2, "Footer", $$Footer, {})} ${renderComponent($$result2, "BottomNav", $$BottomNav, {})} ` })}`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/ipl.astro", void 0);

const $$file = "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/pages/ipl.astro";
const $$url = "/ipl";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ipl,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
