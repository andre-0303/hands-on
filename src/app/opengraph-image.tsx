import { renderOg, ogSize } from "@/lib/og";

export const alt = "Hands On: projetos práticos para aprender programação fazendo";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    title: "Aprenda programação fazendo projeto.",
    detail: "Cenário de empresa, passo a passo, dica e gabarito.",
    meta: ["SQL, Software Engineering, Python e Front-end"],
  });
}
