import { c as createComponent } from './astro-component_UV2PiCzb.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, r as renderTemplate } from './entrypoint_DyBXsGEz.mjs';
import 'clsx';

const $$NewsCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$NewsCard;
  const { id, title, imageUrl, category, featured = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(`/news/${id}`, "href")}${addAttribute(`block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${featured ? "col-span-2" : ""}`, "class")}> <div class="relative"> <img${addAttribute(imageUrl, "src")}${addAttribute(title, "alt")}${addAttribute(`w-full object-cover ${featured ? "h-64" : "h-48"}`, "class")}> ${category && renderTemplate`<span class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 text-xs font-bold rounded shadow-lg"> ${category} </span>`} </div> <div class="p-4"> <h3${addAttribute(`font-bold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors ${featured ? "text-xl" : "text-base"}`, "class")}> ${title} </h3> </div> </a>`;
}, "C:/Users/archi/Desktop/Nav Roll Projects/Mershal.in/mershal/src/components/NewsCard.astro", void 0);

export { $$NewsCard as $ };
