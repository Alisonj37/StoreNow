/*
 * Monta o ZIP para enviar à Hostinger (conteúdo vai direto na pasta do subdomínio).
 *     node ferramentas/pacote.mjs
 * Gera as páginas (gerar.mjs) e cria ../site-hostinger.zip com os arquivos do site
 * na raiz do ZIP, sem as ferramentas e o README.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PASTA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SAIDA = path.resolve(PASTA, "..", "site-hostinger.zip");
const FORA = new Set(["ferramentas", "README.md"]);

execFileSync(process.execPath, [path.join(PASTA, "ferramentas/gerar.mjs")], { stdio: "inherit" });

const itens = fs.readdirSync(PASTA).filter((n) => !FORA.has(n));
fs.rmSync(SAIDA, { force: true });
execFileSync("zip", ["-r", "-X", "-q", SAIDA, ...itens], { cwd: PASTA, stdio: "inherit" });
console.log(`\nZIP pronto: ${SAIDA}`);
console.log("Conteúdo:", itens.join(", "));
