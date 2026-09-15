// Símbolo "h" de blocos. Cor via currentColor.
export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="3" y="1" width="6" height="11" rx="1" />
      <rect x="3" y="13" width="6" height="10" rx="1" />
      <path d="M11 7h7a3 3 0 0 1 3 3v2a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <rect x="15" y="14" width="6" height="9" rx="1" />
    </svg>
  );
}
