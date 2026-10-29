# Sílvio Filho Advocacia — LP trabalhista

Landing page estática (HTML/CSS/JS puro) para campanhas de Meta Ads no Paraná.

## Estrutura
- `index.html` — página principal (formulário no final; todos os CTAs levam a ele).
- `redirect.html` — servida em `/redirect`: confirma o envio e abre o WhatsApp em 3 s.
- `img/` — logo oficial (versões dourada, creme e horizontal), selo, favicon e imagem de compartilhamento.
- `scripts/build.mjs` — build da Vercel: copia os arquivos para `dist/` e baixa as fotos do banco Freepik, convertendo para WebP (800 e 1400 px).

## Antes de ativar as campanhas
1. **WhatsApp**: preencher `CONFIG.whatsapp` em `redirect.html` (só dígitos, 55 + DDD). Enquanto estiver vazio, o lead é gravado e a página de confirmação não redireciona.
2. **OAB**: inserir a inscrição no rodapé de `index.html` (comentário "OAB").
3. **Política de privacidade**: texto a ser revisado pelo escritório.
4. **Pixel do Meta**: colar o código base no `<head>` de `index.html` e `redirect.html`. O evento `Lead` já é disparado em `redirect.html`, sem dados pessoais.
5. **Revisão do texto** pelo advogado (Provimento 205/2021 da OAB).

## Dados
Visitas e leads vão para o Supabase "ADS BR CLIENTES", tabelas `lp_visits` e `lp_leads`, `site = "silvio-filho"`.
