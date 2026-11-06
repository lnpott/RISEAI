import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Copy,
  KeyRound,
  ShieldOff,
  Upload,
  Check,
} from "lucide-react";
import { parseCharacterFile, type ParsedCard } from "@/lib/card";

export const Route = createFileRoute("/")({ component: Home });

type ProviderId = "horde" | "openrouter" | "featherless" | "custom";

const PROVIDERS: {
  id: ProviderId;
  name: string;
  cost: string;
  filter: string;
  url: string;
  format: string;
  modelHint: string;
  keyHint: string;
  steps: string[];
  href: string;
}[] = [
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
      "Manda uma mensagem curta. Se demorar, a fila tá cheia — normal.",
    ],
    href: "https://aihorde.net",
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
      "Sobe Max Context. Testa com uma fala curta antes de card gigante.",
    ],
    href: "https://openrouter.ai/models",
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
      "Cola a key, cola o model id, Format OpenAI Compatible.",
    ],
    href: "https://featherless.ai",
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
      "Streaming ligado. Context alto o bastante pro card.",
    ],
    href: "https://uncensoredllm.ai",
  },
];

function Home() {
  const [tab, setTab] = useState<"passos" | "api" | "card">("passos");
  const [providerId, setProviderId] = useState<ProviderId>("horde");
  const [model, setModel] = useState("");
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<ParsedCard | null>(null);
  const [cardError, setCardError] = useState("");
  const provider = PROVIDERS.find((p) => p.id === providerId)!;

  const snippet = useMemo(() => {
    return [
      `Provedor: ${provider.name}`,
      `Format: ${provider.format}`,
      `URL: ${provider.url}`,
      `Modelo: ${model.trim() || provider.modelHint}`,
      `Filtro: ${provider.filter}`,
    ].join("\n");
  }, [provider, model]);

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setCardError("");
    setCard(null);
    try {
      setCard(await parseCharacterFile(file));
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Não deu pra ler o card.");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          RisuAI · sem GPU
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight text-fg">
          Setup local, API sem frescura de filtro.
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          O Risu não tem cérebro. Você instala o app, aponta pra uma API e
          importa o PNG do personagem. Gemini, OpenAI e Claude recusam
          conteúdo — aqui eles nem entram.
        </p>
      </header>

      <nav className="mb-6 grid grid-cols-3 gap-2">
        {(
          [
            ["passos", "Passos", BookOpen],
            ["api", "APIs", ShieldOff],
            ["card", "Card", Upload],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-sm font-medium " +
              (tab === id
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-surface text-fg")
            }
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </nav>

      {tab === "passos" && (
        <ol className="flex flex-col gap-3">
          {[
            [
              "Abre o Risu",
              "No celular ou PC: risuai.net. No PC, o app de desktop nas releases do GitHub kwaroran/RisuAI guarda os chats na máquina. Sem GPU nos dois casos — o modelo roda na nuvem.",
            ],
            [
              "Pula o guia",
              "Na primeira tela escolhe “I will setup myself”. Idioma pode ficar em inglês; a interface em PT é incompleta.",
            ],
            [
              "Escolhe API sem filtro",
              "Aba APIs desta página. Horde é o único zero-custo de verdade. Qualquer coisa boa e sem recusa é paga e barata, ou lenta.",
            ],
            [
              "Sobe o contexto",
              "Instalação nova começa em ~4000 tokens. Card longo estoura isso e a resposta vem vazia ou cortada. Sobe o Max Context pro que o modelo aguenta.",
            ],
            [
              "Importa o personagem",
              "Botão de adicionar na lista, ou arrasta o PNG/JSON. A aba Card lê o arquivo aqui antes, pra você ver se a metadata sobreviveu.",
            ],
            [
              "Testa",
              "Uma frase curta. Se vier recusa moralista, o modelo ainda tem filtro — troca. Se vier erro 401, a key tá errada. Se vier 404, a URL não termina no path certo.",
            ],
          ].map(([title, body], i) => (
            <li
              key={title}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="font-display text-xl text-fg">
                <span className="mr-2 text-primary">{i + 1}</span>
                {title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
          <li className="rounded-xl border border-border bg-surface-2 p-4 text-sm leading-relaxed text-muted">
            Local sem GPU não roda modelo decente. CPU em modelo de 7B é
            lento e burro. “Local” aqui é o Risu no seu aparelho; o texto sai
            de uma API. Horde é o único grátis que às vezes não censura.
          </li>
        </ol>
      )}

      {tab === "api" && (
        <section className="flex flex-col gap-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProviderId(p.id)}
                className={
                  "min-h-11 rounded-xl border px-3 py-3 text-left " +
                  (providerId === p.id
                    ? "border-primary bg-surface-2"
                    : "border-border bg-surface")
                }
              >
                <span className="block font-medium text-fg">{p.name}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {p.cost}
                </span>
              </button>
            ))}
          </div>

          <article className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl text-fg">{provider.name}</h2>
              <a
                href={provider.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-sm font-medium text-primary underline"
              >
                Abrir site
              </a>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{provider.filter}</p>
            <ol className="mt-4 flex flex-col gap-2">
              {provider.steps.map((step, i) => (
                <li key={step} className="text-sm leading-relaxed text-fg">
                  <span className="mr-2 text-primary">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            <label className="mt-5 block text-sm font-medium text-fg">
              <span className="mb-2 flex items-center gap-2">
                <KeyRound className="size-4 text-primary" aria-hidden />
                Model id (opcional, só pra copiar o bloco)
              </span>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={provider.modelHint}
                className="w-full rounded-lg border border-border bg-bg px-3 py-3 text-sm text-fg outline-none"
              />
            </label>
            <p className="mt-2 text-xs text-muted">Key fica só no Risu. Não cola aqui.</p>

            <pre className="mt-4 overflow-x-auto rounded-lg bg-bg p-3 text-xs leading-relaxed text-fg whitespace-pre-wrap">
              {snippet}
            </pre>
            <button
              type="button"
              onClick={copySnippet}
              className="mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copiado" : "Copiar bloco"}
            </button>
          </article>
        </section>
      )}

      {tab === "card" && (
        <section className="flex flex-col gap-4">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center">
            <Upload className="size-6 text-primary" aria-hidden />
            <span className="text-sm font-medium text-fg">
              Solta o PNG ou JSON do personagem
            </span>
            <span className="text-xs text-muted">
              Leitura só neste navegador. Nada é enviado.
            </span>
            <input
              type="file"
              accept=".png,.json,image/png,application/json"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          {cardError && (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-danger">
              {cardError}
            </p>
          )}
          {card && (
            <article className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs tracking-wide text-primary uppercase">{card.spec}</p>
              <h2 className="mt-1 font-display text-3xl text-fg">{card.name}</h2>
              {card.creator && (
                <p className="mt-1 text-sm text-muted">por {card.creator}</p>
              )}
              {card.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {card.tags.slice(0, 12).map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              <Field label="Descrição" text={card.description} />
              <Field label="Personalidade" text={card.personality} />
              <Field label="Cenário" text={card.scenario} />
              <Field label="Primeira fala" text={card.firstMes} />
              <p className="mt-4 text-sm text-muted">
                Se os campos apareceram, o Risu importa esse arquivo. Arrasta o
                mesmo PNG na lista de personagens.
              </p>
            </article>
          )}
        </section>
      )}
    </main>
  );
}

function Field({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="mt-4">
      <h3 className="text-xs font-medium tracking-wide text-muted uppercase">{label}</h3>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-fg">{text}</p>
    </div>
  );
}
