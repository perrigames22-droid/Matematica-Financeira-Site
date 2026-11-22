# FINANÇAS 2B - Site de Educação Financeira
Turma 2º B · SENAC Campinas · João Pedro Nascimento Silva, Antony Ferraz de Barros, Luca Perri, Enzo Carvalho Petrocco.

## Como abrir
Dê dois cliques em `index.html` (funciona sem servidor, sem banco de dados e sem login). Para publicar: envie a pasta para o GitHub Pages ou Netlify (hospedagem estática). **O site ainda não foi publicado.**

## Arquivos
- `index.html`: páginas (Início, Financiamentos, Investimentos, Aprenda, Reflexão, Fontes).
- `style.css`: identidade visual (azul-marinho e turquesa) e responsividade.
- `calc.js`: cálculos e validações (em centavos inteiros).
- `script.js`: interface, tabelas, gráficos SVG e textos educativos.
- `tests.js` e `TESTES.md`: testes (`node tests.js` regera o TESTES.md).

## Fórmulas
- **SAC:** amortização = PV/n; juros = saldo anterior × i; prestação = amortização + juros; saldo final = saldo inicial − amortização.
- **PRICE:** PMT = PV·i / [1 − (1+i)^(−n)]; juros = saldo inicial × i; amortização = PMT − juros.
- **Taxa zero:** SAC e PRICE pagam PV/n por mês.
- **Renda fixa:** M = C·(1+i)^n; rendimento = M − C.
- i = taxa em % ÷ 100 (2% → 0,02). Arredondamento ao centavo; a última parcela quita o saldo.

## Limitações
Sem seguros, tarifas, IOF, impostos ou inflação. Datas de consulta na página Fontes estão "A preencher". Os links apontam para as páginas iniciais das fontes; confirmem antes de entregar.

## Ferramentas e IA
HTML5, CSS3 e JavaScript puro, sem bibliotecas. Código gerado com o Claude (Anthropic) e revisado pelo grupo. Testes executados com Node.js.
