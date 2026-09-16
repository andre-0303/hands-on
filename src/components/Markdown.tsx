import ReactMarkdown, { MarkdownAsync } from "react-markdown";
import rehypeShiki from "@shikijs/rehype";
import { CopyCode } from "@/components/CopyCode";

export function Markdown({ children }: { children: string }) {
  return (
    <CopyCode>
      <MarkdownAsync
        // Conteúdo vem da IA: links externos sem repassar referrer nem SEO.
        components={{
          a: ({ href, title, children }) => (
            <a href={href} title={title} rel="nofollow noopener noreferrer">
              {children}
            </a>
          ),
        }}
        rehypePlugins={[[rehypeShiki, { theme: "vesper", lazy: true, defaultLanguage: "text", fallbackLanguage: "text" }]]}
      >
        {children}
      </MarkdownAsync>
    </CopyCode>
  );
}

// Campos curtos (títulos, resumo, pré-requisitos): só ênfase e código inline, sem parágrafo.
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <span className="md-inline">
      <ReactMarkdown allowedElements={["em", "strong", "code", "del"]} unwrapDisallowed>
        {children}
      </ReactMarkdown>
    </span>
  );
}
