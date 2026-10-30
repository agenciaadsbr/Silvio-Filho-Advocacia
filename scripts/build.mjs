// Build da LP: copia os arquivos estáticos para dist/ e traz as fotos.
//
// As fotos são versões LICENCIADAS do Freepik (sem marca d'água), já
// convertidas para WebP e guardadas no Supabase "ADS BR CLIENTES",
// bucket público lp-assets, pasta silvio-filho/fotos/. O build copia
// cada arquivo para dist/img/f2 (pasta versionada: ao trocar fotos, mude para f3 para furar o cache), então a página serve as imagens pelo
// próprio domínio (mais rápido e sem depender do Supabase no carregamento).
//
// Para trocar uma foto: suba o novo WebP no bucket com o mesmo nome
// (ou um nome novo, atualizando a lista abaixo e o index.html).
// Se algum arquivo não puder ser baixado, o build falha — a Vercel mantém
// a versão anterior no ar, então a página nunca vai ao ar com imagem quebrada.

import { mkdir, copyFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DIST = "dist";
const BASE = "https://qxhnjzyhtllmtdrcyygi.supabase.co/storage/v1/object/public/lp-assets/silvio-filho/fotos/";
const FOTOS = {
  hero: [800, 1400, 1920],
  saude: [800, 1400, 1920],
  justa: [800, 1400],
  indireta: [800, 1400],
  assedio: [800, 1400],
  acidente: [800, 1400],
  doenca: [800, 1400],
  contato: [800, 1400]
};
const PAGINAS = ["index.html", "redirect.html", "dashboard.html", "robots.txt"];

async function copiarPasta(origem, destino) {
  await mkdir(destino, { recursive: true });
  for (const item of await readdir(origem, { withFileTypes: true })) {
    const o = join(origem, item.name), d = join(destino, item.name);
    if (item.isDirectory()) await copiarPasta(o, d);
    else await copyFile(o, d);
  }
}

async function baixar(arquivo) {
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(BASE + arquivo);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 2000) throw new Error("arquivo muito pequeno");
      return buf;
    } catch (e) {
      console.warn(`[fotos] ${arquivo}: tentativa ${tentativa} falhou (${e.message})`);
      if (tentativa === 3) throw new Error(`Não foi possível baixar "${arquivo}"`);
      await new Promise(ok => setTimeout(ok, 1500 * tentativa));
    }
  }
}

await mkdir(join(DIST, "img", "f2"), { recursive: true });
for (const f of PAGINAS) await copyFile(f, join(DIST, f));
await copiarPasta("img", join(DIST, "img"));

for (const [nome, larguras] of Object.entries(FOTOS)) {
  for (const w of larguras) {
    const arquivo = `${nome}-${w}.webp`;
    await writeFile(join(DIST, "img", "fotos", arquivo), await baixar(arquivo));
  }
  console.log(`[fotos] ${nome} ok`);
}
console.log("Build concluído.");
