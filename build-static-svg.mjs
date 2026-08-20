import { readFile, writeFile } from "node:fs/promises";

const repo = process.argv[2] || "AetherGamesOfficial/Rainbow-potatoe";
const cdnBase = `https://cdn.jsdelivr.net/gh/${repo}@main/`;
const buildStamp = "srcdoc-launch-fix-20260820";
const pages = ["studyhub", "enrichment", "resources", "research", "settings", "loading", "arctic-test"];
const navPages = "studyhub|enrichment|resources|research|settings";
const shellBackground = `${cdnBase}aether%20background.png`;
const faviconImage = `${cdnBase}aether-favicon.png`;

function toStaticLink(page, attrs, content) {
	return `<a${attrs} href="${cdnBase}${page}.svg" target="_parent">${content}</a>`;
}

function escapeHtmlAttribute(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function convertStaticPaths(html) {
	let converted = html
		.replace(/aether background\.png/g, shellBackground)
		.replace(/aether-favicon\.png/g, faviconImage)
		.replace(/\s*<script src="page-loader\.js"><\/script>/g, "")
		.replace(/\s*<script src="\/bootstrap-init\.js"><\/script>/g, "")
		.replace(/src="search\.js"/g, `src="${cdnBase}search.js"`)
		.replace(/__AETHER_STATIC_CDN_BASE__/g, cdnBase)

	converted = converted.replace(
		new RegExp(`<button([^>]*?)onclick="window\\.location\\.href='(${navPages})\\.html'"([^>]*)>([\\s\\S]*?)<\\/button>`, "g"),
		(_match, before, page, after, content) => toStaticLink(page, `${before}${after}`, content)
	);

	converted = converted.replace(
		new RegExp(`<button([^>]*?)onclick="window\\.location\\.href=\\"(${navPages})\\.html\\""([^>]*)>([\\s\\S]*?)<\\/button>`, "g"),
		(_match, before, page, after, content) => toStaticLink(page, `${before}${after}`, content)
	);

	converted = converted.replace(
		new RegExp(`window\\.location\\.href\\s*=\\s*'(${navPages})\\.html'`, "g"),
		(_match, page) => `window.parent.location.href = "${cdnBase}${page}.svg"`
	);

	converted = converted.replace(
		new RegExp(`window\\.location\\.href\\s*=\\s*"(${navPages})\\.html"`, "g"),
		(_match, page) => `window.parent.location.href = "${cdnBase}${page}.svg"`
	);

	converted = converted.replace(
		/window\.location\.href = `research\.html\?goto=\$\{encodeURIComponent\(([^}]+)\)\}`/g,
		`window.parent.location.href = \`${cdnBase}research.svg?goto=\${encodeURIComponent($1)}\``
	);

	return converted;
}

function svgDocument(title, html) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${buildStamp} -->
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" style="position:fixed;inset:0;width:100%;height:100%;display:block;margin:0;padding:0;background:#121212 url('${shellBackground}') center / cover no-repeat;">
  <title>${title}</title>
  <style>
    html, body, svg, foreignObject { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #121212 url('${shellBackground}') center / cover no-repeat; }
    foreignObject { display: block; }
    iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; margin: 0; padding: 0; display: block; background: #121212 url('${shellBackground}') center / cover no-repeat; }
  </style>
  <foreignObject x="0" y="0" width="100%" height="100%">
    <iframe xmlns="http://www.w3.org/1999/xhtml" srcdoc="${escapeHtmlAttribute(html)}" allow="autoplay; fullscreen; gamepad"></iframe>
  </foreignObject>
</svg>
`;
}

for (const page of pages) {
	const html = await readFile(`${page}.html`, "utf8");
	await writeFile(`${page}.svg`, svgDocument(page, convertStaticPaths(html)), "utf8");
}

await writeFile("index.svg", await readFile("studyhub.svg"), "utf8");
await writeFile("new.svg", await readFile("studyhub.svg"), "utf8");
