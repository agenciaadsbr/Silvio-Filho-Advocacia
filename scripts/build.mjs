// Build da LP: copia os arquivos estáticos para dist/ e baixa as fotos de banco
// de imagem (Freepik, licença gratuita com atribuição no rodapé), convertendo
// cada uma para WebP em duas larguras (800 e 1400 px).
//
// As fotos não ficam no repositório: são baixadas a cada build da Vercel.
// Para trocar uma foto, troque a URL na lista FOTOS abaixo.
// Se algum download falhar, o build falha — a Vercel mantém a versão anterior
// no ar, então a página nunca é publicada com imagem quebrada.

import { mkdir, copyFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const DIST = "dist";
const FOTOS = {
  hero: "portrait-middle-aged-warehouse-worker-standing-large-warehouse-distribution-center-with-arms-crossed_342744-1543",
  justa: "distraught-car-mechanic-going-through-problematic-paperwork-with-his-manager-auto-repair-shop_637285-7584",
  indireta: "woman-worker-taking-notes-warehouse_23-2149128300",
  assedio: "serious-call-center-operator-dark-office_74855-3079",
  acidente: "professional-female-driver-operating-forklift-vehicle_23-2150248789",
  doenca: "female-nurse-staring-out-window_53876-139578",
  contato: "young-hispanic-man-using-smartphone-sitting-sofa-home_839833-15181"
};
const LARGURAS = [800, 1400];

async function copiarPasta(origem, destino) {
  await mkdir(destino, { recursive: true });
  for (const item of await readdir(origem, { withFileTypes: true })) {
    const o = join(origem, item.name), d = join(destino, item.name);
    if (item.isDirectory()) await copiarPasta(o, d);
    else await copyFile(o, d);
  }
}

async function baixar(nome, slug) {
  const url = `https://img.magnific.com/free-photo/${slug}.jpg?w=1800`;
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (build)" } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      console.warn(`[fotos] ${nome}: tentativa ${tentativa} falhou (${e.message})`);
      if (tentativa === 3) throw new Error(`Não foi possível baixar a foto "${nome}"`);
      await new Promise(ok => setTimeout(ok, 1500 * tentativa));
    }
  }
}

await mkdir(join(DIST, "img", "fotos"), { recursive: true });
for (const f of ["index.html", "redirect.html", "robots.txt"]) await copyFile(f, join(DIST, f));
await copiarPasta("img", join(DIST, "img"));

const dimensoes = {};
for (const [nome, slug] of Object.entries(FOTOS)) {
  const original = await baixar(nome, slug);
  for (const w of LARGURAS) {
    const saida = join(DIST, "img", "fotos", `${nome}-${w}.webp`);
    const info = await sharp(original)
      .resize({ width: w, height: w, fit: "inside", withoutEnlargement: true })
      .webp({ quality: w > 1000 ? 70 : 66, effort: 5 })
      .toFile(saida);
    dimensoes[`${nome}-${w}`] = [info.width, info.height];
  }
  console.log(`[fotos] ${nome} ok`);
}
await writeFile(join(DIST, "img", "fotos", "dimensoes.json"), JSON.stringify(dimensoes, null, 1));
console.log("Build concluído.");
