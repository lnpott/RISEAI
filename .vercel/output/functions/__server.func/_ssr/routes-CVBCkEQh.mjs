import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Copy, i as KeyRound, o as Check, r as ShieldOff, s as BookOpen, t as Upload } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CVBCkEQh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readChunk(view, offset) {
	const length = view.getUint32(offset);
	const type = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
	const dataStart = offset + 8;
	const dataEnd = dataStart + length;
	return {
		type,
		dataStart,
		dataEnd,
		next: dataEnd + 4
	};
}
function latin1(bytes) {
	let out = "";
	for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
	return out;
}
function pickString(obj, keys) {
	for (const key of keys) {
		const value = obj[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
	return "";
}
function normalize(raw) {
	if (!raw || typeof raw !== "object") return null;
	const root = raw;
	const data = root.data && typeof root.data === "object" ? root.data : root;
	const tags = Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === "string") : [];
	const card = {
		name: pickString(data, ["name"]) || "Sem nome",
		description: pickString(data, ["description"]),
		personality: pickString(data, ["personality"]),
		scenario: pickString(data, ["scenario"]),
		firstMes: pickString(data, ["first_mes", "firstMes"]),
		creator: pickString(data, ["creator"]),
		tags,
		spec: pickString(root, ["spec"]) || "legado"
	};
	if (!card.description && !card.firstMes && card.name === "Sem nome") return null;
	return card;
}
async function parseCharacterFile(file) {
	if (file.name.toLowerCase().endsWith(".json") || file.type === "application/json") {
		const parsed = normalize(JSON.parse(await file.text()));
		if (!parsed) throw new Error("JSON sem ficha de personagem.");
		return parsed;
	}
	const buf = await file.arrayBuffer();
	const bytes = new Uint8Array(buf);
	const view = new DataView(buf);
	if (bytes.length < 8 || latin1(bytes.slice(0, 8)) !== "PNG\r\n\n") throw new Error("Arquivo não é PNG nem JSON de card.");
	let offset = 8;
	const texts = [];
	while (offset + 12 <= bytes.length) {
		const chunk = readChunk(view, offset);
		if (chunk.type === "tEXt" || chunk.type === "iTXt") {
			const raw = latin1(bytes.slice(chunk.dataStart, chunk.dataEnd));
			const nul = raw.indexOf("\0");
			if (nul > 0) texts.push({
				key: raw.slice(0, nul),
				value: raw.slice(nul + 1)
			});
		}
		if (chunk.type === "IEND") break;
		offset = chunk.next;
	}
	for (const key of ["ccv3", "chara"]) {
		const hit = texts.find((t) => t.key === key);
		if (!hit) continue;
		try {
			const card = normalize(JSON.parse(atob(hit.value.replace(/\s/g, ""))));
			if (card) {
				card.spec = key;
				return card;
			}
		} catch {}
	}
	throw new Error("PNG sem metadata de personagem (chara/ccv3). Screenshot não serve.");
}
var PROVIDERS = [
	{
		id: "horde",
		name: "AI Horde",
		cost: "Grátis, sem cartão",
		filter: "Depende do worker. Muitos modelos sem filtro, qualidade e fila ruins.",
		url: "(provedor nativo Horde — não cola URL)",
		format: "Horde",
		modelHint: "deixa o Risu escolher o modelo da fila",
		keyHint: "opcional. Anônimo funciona, key grátis em aihorde.net acelera.",
		steps: [
			"No Risu, Settings → modelo → Horde.",
			"Key em branco pra testar, ou cola a key do aihorde.net.",
			"Sobe o Max Context pra uns 8k se o modelo aguentar.",
			"Manda uma mensagem curta. Se demorar, a fila tá cheia — normal."
		],
		href: "https://aihorde.net"
	},
	{
		id: "openrouter",
		name: "OpenRouter",
		cost: "Modelos :free têm cota diária (~50 req). O resto é pago.",
		filter: "A maioria ainda recusa. Procura no catálogo os marcados uncensored (Venice, Cydonia e afins). Não é zero filtro.",
		url: "https://openrouter.ai/api/v1/chat/completions",
		format: "OpenAI Compatible — ou o provedor nativo OpenRouter",
		modelHint: "copia o id exato da página do modelo (não inventa)",
		keyHint: "sk-or-… em openrouter.ai/keys",
		steps: [
			"Cria a key em openrouter.ai/keys.",
			"No Risu escolhe OpenRouter, ou Custom API se a versão pedir os 4 campos.",
			"URL completa com /chat/completions se for Custom.",
			"Request Model = id copiado do catálogo. Format = OpenAI Compatible.",
			"Sobe Max Context. Testa com uma fala curta antes de card gigante."
		],
		href: "https://openrouter.ai/models"
	},
	{
		id: "featherless",
		name: "Featherless",
		cost: "Assinatura (não é grátis). Ilimitado no plano.",
		filter: "Catálogo de roleplay aberto, bem menos recusa que Gemini/Claude.",
		url: "https://api.featherless.ai/v1",
		format: "OpenAI Compatible",
		modelHint: "id do modelo no painel deles",
		keyHint: "key da conta Featherless",
		steps: [
			"Abre a conta e gera a key.",
			"Risu → Custom API.",
			"URL: https://api.featherless.ai/v1 (se a build exigir path cheio, usa …/v1/chat/completions).",
			"Cola a key, cola o model id, Format OpenAI Compatible."
		],
		href: "https://featherless.ai"
	},
	{
		id: "custom",
		name: "API dedicada sem filtro",
		cost: "Pré-pago por token. Barato, mas não é de graça.",
		filter: "É o que existe de menos restrição: o modelo foi feito pra não recusar roleplay adulto.",
		url: "https://api.uncensoredllm.ai/v1/chat/completions",
		format: "OpenAI Compatible",
		modelHint: "ex.: gemma-4-31b-fabled — confirma no catálogo do provedor",
		keyHint: "key do console (mostrada uma vez)",
		steps: [
			"Gera a key no console do provedor.",
			"Risu → Custom API.",
			"URL com /v1/chat/completions no final.",
			"Key, Request Model copiado, Format OpenAI Compatible.",
			"Streaming ligado. Context alto o bastante pro card."
		],
		href: "https://uncensoredllm.ai"
	}
];
function Home() {
	const [tab, setTab] = (0, import_react.useState)("passos");
	const [providerId, setProviderId] = (0, import_react.useState)("horde");
	const [model, setModel] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [card, setCard] = (0, import_react.useState)(null);
	const [cardError, setCardError] = (0, import_react.useState)("");
	const provider = PROVIDERS.find((p) => p.id === providerId);
	const snippet = (0, import_react.useMemo)(() => {
		return [
			`Provedor: ${provider.name}`,
			`Format: ${provider.format}`,
			`URL: ${provider.url}`,
			`Modelo: ${model.trim() || provider.modelHint}`,
			`Filtro: ${provider.filter}`
		].join("\n");
	}, [provider, model]);
	async function copySnippet() {
		await navigator.clipboard.writeText(snippet);
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	}
	async function onFile(file) {
		if (!file) return;
		setCardError("");
		setCard(null);
		try {
			setCard(await parseCharacterFile(file));
		} catch (err) {
			setCardError(err instanceof Error ? err.message : "Não deu pra ler o card.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium tracking-wide text-primary uppercase",
						children: "RisuAI · sem GPU"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-4xl leading-tight text-fg",
						children: "Setup local, API sem frescura de filtro."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-base leading-relaxed text-muted",
						children: "O Risu não tem cérebro. Você instala o app, aponta pra uma API e importa o PNG do personagem. Gemini, OpenAI e Claude recusam conteúdo — aqui eles nem entram."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "mb-6 grid grid-cols-3 gap-2",
				children: [
					[
						"passos",
						"Passos",
						BookOpen
					],
					[
						"api",
						"APIs",
						ShieldOff
					],
					[
						"card",
						"Card",
						Upload
					]
				].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-sm font-medium " + (tab === id ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-4",
						"aria-hidden": true
					}), label]
				}, id))
			}),
			tab === "passos" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "flex flex-col gap-3",
				children: [[
					["Abre o Risu", "No celular ou PC: risuai.net. No PC, o app de desktop nas releases do GitHub kwaroran/RisuAI guarda os chats na máquina. Sem GPU nos dois casos — o modelo roda na nuvem."],
					["Pula o guia", "Na primeira tela escolhe “I will setup myself”. Idioma pode ficar em inglês; a interface em PT é incompleta."],
					["Escolhe API sem filtro", "Aba APIs desta página. Horde é o único zero-custo de verdade. Qualquer coisa boa e sem recusa é paga e barata, ou lenta."],
					["Sobe o contexto", "Instalação nova começa em ~4000 tokens. Card longo estoura isso e a resposta vem vazia ou cortada. Sobe o Max Context pro que o modelo aguenta."],
					["Importa o personagem", "Botão de adicionar na lista, ou arrasta o PNG/JSON. A aba Card lê o arquivo aqui antes, pra você ver se a metadata sobreviveu."],
					["Testa", "Uma frase curta. Se vier recusa moralista, o modelo ainda tem filtro — troca. Se vier erro 401, a key tá errada. Se vier 404, a URL não termina no path certo."]
				].map(([title, body], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-xl text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 text-primary",
							children: i + 1
						}), title]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted",
						children: body
					})]
				}, title)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed text-muted",
					children: "Local sem GPU não roda modelo decente. CPU em modelo de 7B é lento e burro. “Local” aqui é o Risu no seu aparelho; o texto sai de uma API. Horde é o único grátis que às vezes não censura."
				})]
			}),
			tab === "api" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setProviderId(p.id),
						className: "min-h-11 rounded-xl border px-3 py-3 text-left " + (providerId === p.id ? "border-primary bg-surface-2" : "border-border bg-surface"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-medium text-fg",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-xs leading-relaxed text-muted",
							children: p.cost
						})]
					}, p.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-xl border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl text-fg",
								children: provider.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: provider.href,
								target: "_blank",
								rel: "noreferrer",
								className: "shrink-0 text-sm font-medium text-primary underline",
								children: "Abrir site"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: provider.filter
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-4 flex flex-col gap-2",
							children: provider.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm leading-relaxed text-fg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mr-2 text-primary",
									children: [i + 1, "."]
								}), step]
							}, step))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-5 block text-sm font-medium text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mb-2 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, {
									className: "size-4 text-primary",
									"aria-hidden": true
								}), "Model id (opcional, só pra copiar o bloco)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: model,
								onChange: (e) => setModel(e.target.value),
								placeholder: provider.modelHint,
								className: "w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-fg outline-none"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted",
							children: "Key fica só no Risu. Não cola aqui."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "mt-4 overflow-x-auto rounded-lg bg-bg p-3 text-xs leading-relaxed text-fg whitespace-pre-wrap",
							children: snippet
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: copySnippet,
							className: "mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg",
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Copiado" : "Copiar bloco"]
						})
					]
				})]
			}),
			tab === "card" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
								className: "size-6 text-primary",
								"aria-hidden": true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-fg",
								children: "Solta o PNG ou JSON do personagem"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: "Leitura só neste navegador. Nada é enviado."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: ".png,.json,image/png,application/json",
								className: "sr-only",
								onChange: (e) => onFile(e.target.files?.[0])
							})
						]
					}),
					cardError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl border border-border bg-surface px-4 py-3 text-sm text-danger",
						children: cardError
					}),
					card && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-xl border border-border bg-surface p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tracking-wide text-primary uppercase",
								children: card.spec
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 font-display text-3xl text-fg",
								children: card.name
							}),
							card.creator && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: ["por ", card.creator]
							}),
							card.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-wrap gap-2",
								children: card.tags.slice(0, 12).map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full bg-surface-2 px-3 py-1 text-xs text-muted",
									children: tag
								}, tag))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Descrição",
								text: card.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Personalidade",
								text: card.personality
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Cenário",
								text: card.scenario
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Primeira fala",
								text: card.firstMes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm text-muted",
								children: "Se os campos apareceram, o Risu importa esse arquivo. Arrasta o mesmo PNG na lista de personagens."
							})
						]
					})
				]
			})
		]
	});
}
function Field({ label, text }) {
	if (!text) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-xs font-medium tracking-wide text-muted uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm leading-relaxed whitespace-pre-wrap text-fg",
			children: text
		})]
	});
}
//#endregion
export { Home as component };
