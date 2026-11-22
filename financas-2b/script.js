/* script.js - interface: navegação, formulários, tabelas, gráficos e conteúdo educativo. */
const $ = (s) => document.querySelector(s);
const { brl, pct } = Calc;

/* ---------- Navegação por páginas (#hash) e menu mobile ---------- */
function mostra() {
  const id = location.hash.slice(1) || 'inicio';
  document.querySelectorAll('.page').forEach((p) => p.classList.toggle('on', p.id === id));
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('on', a.hash === '#' + id));
  $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false');
  scrollTo(0, 0);
}
addEventListener('hashchange', mostra); mostra();
$('#menu').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', o); };

/* ---------- Auxiliares ---------- */
const tabela = (cab, linhas) => `<div class="scroll"><table><thead><tr>${cab.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const kpi = (t, v) => `<div class="card kpi"><span>${t}</span><b>${v}</b></div>`;
const erros = (form, e) => form.querySelectorAll('.err').forEach((s) => {
  const campo = form.elements[s.dataset.for]; s.textContent = e[s.dataset.for] || '';
  campo.setAttribute('aria-invalid', !!e[s.dataset.for]);
});
const dados = (form, nomes) => Object.fromEntries(nomes.map((n) => [n, form.elements[n].value]));

/* Gráfico de linhas em SVG (sem bibliotecas). series = [{nome, cor, d:[centavos]}] */
function grafico(svg, series, rotX) {
  const W = 420, H = 250, L = 58, n = series[0].d.length, todos = series.flatMap((s) => s.d);
  const max = Math.max(...todos), min = Math.min(0, ...todos);
  const x = (i) => L + ((W - L - 10) * i) / Math.max(n - 1, 1);
  const y = (v) => H - 30 - ((H - 56) * (v - min)) / (max - min || 1);
  const fmt = (v) => 'R$ ' + (v / 100).toLocaleString('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML =
    [0, 0.5, 1].map((t) => { const v = min + (max - min) * t; return `<line x1="${L}" x2="${W - 10}" y1="${y(v)}" y2="${y(v)}" stroke="#2a4a7c"/><text x="${L - 5}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }).join('') +
    series.map((s, k) => `<polyline fill="none" stroke="${s.cor}" stroke-width="3" stroke-linejoin="round" points="${s.d.map((v, i) => x(i) + ',' + y(v)).join(' ')}"/><text x="${L + k * 90}" y="14" style="fill:${s.cor}">● ${s.nome}</text>`).join('') +
    `<text x="${L}" y="${H - 8}">${rotX[0]}</text><text x="${W - 10}" y="${H - 8}" text-anchor="end">${rotX[1]}</text>`;
}

/* ---------- Financiamento ---------- */
const fin = $('#fin');
fin.addEventListener('submit', (e) => {
  e.preventDefault();
  const r = Calc.validar(dados(fin, ['valor', 'taxa', 'parcelas']));
  erros(fin, r.erros);
  if (!r.ok) { $('#fin-res').hidden = true; $('#fin-st').textContent = ''; return; }
  const sis = fin.elements.sis.value, i = r.v.taxa / 100, n = r.v.parcelas;
  const A = Calc.financiar(r.v.valor, i, n, 'SAC'), B = Calc.financiar(r.v.valor, i, n, 'PRICE'), S = sis === 'SAC' ? A : B;
  $('#fin-kpi').innerHTML = kpi('Primeira parcela', brl(S.primeira)) + kpi('Última parcela', brl(S.ultima)) + kpi('Total de juros', brl(S.juros)) + kpi('Total pago', brl(S.total)) + kpi('Valor amortizado', brl(S.amort)) + kpi('Taxa informada', pct(r.v.taxa));
  const dif = Math.abs(A.total - B.total), igual = A.total === B.total;
  $('#fin-cmp').innerHTML = tabela(['Critério', 'SAC', 'PRICE', 'Resultado'], [
    ['Primeira parcela', brl(A.primeira), brl(B.primeira), A.primeira === B.primeira ? 'Iguais' : (A.primeira > B.primeira ? 'SAC é maior' : 'PRICE é maior')],
    ['Última parcela', brl(A.ultima), brl(B.ultima), A.ultima === B.ultima ? 'Iguais' : (A.ultima < B.ultima ? 'SAC é menor' : 'PRICE é menor')],
    ['Total de juros', brl(A.juros), brl(B.juros), igual ? 'Iguais' : (A.juros < B.juros ? 'SAC gera menos juros' : 'PRICE gera menos juros')],
    ['Total pago', brl(A.total), brl(B.total), 'Diferença: ' + brl(dif)],
  ]);
  const saldos = (X) => [Math.round(r.v.valor * 100), ...X.linhas.map((l) => l.fim)];
  grafico($('#g-pres'), [{ nome: 'SAC', cor: '#22d3c5', d: A.linhas.map((l) => l.p) }, { nome: 'PRICE', cor: '#ffc857', d: B.linhas.map((l) => l.p) }], ['Parcela 1', 'Parcela ' + n]);
  grafico($('#g-saldo'), [{ nome: 'SAC', cor: '#22d3c5', d: saldos(A) }, { nome: 'PRICE', cor: '#ffc857', d: saldos(B) }], ['Início', 'Parcela ' + n]);
  $('#fin-tit').textContent = 'Tabela mensal - ' + sis;
  $('#fin-tab').innerHTML = tabela(['Parcela', 'Saldo inicial', 'Juros', 'Amortização', 'Prestação', 'Saldo final'], S.linhas.map((l) => [l.k, brl(l.ini), brl(l.j), brl(l.a), brl(l.p), brl(l.fim)]));
  $('#fin-res').hidden = false; $('#fin-st').textContent = '✔ Simulação ' + sis + ' concluída.';
});
fin.elements.sis.onchange = () => { if (!$('#fin-res').hidden) fin.requestSubmit(); };
fin.addEventListener('reset', () => { erros(fin, {}); $('#fin-res').hidden = true; $('#fin-st').textContent = ''; });

/* ---------- Investimento ---------- */
const inv = $('#inv');
inv.addEventListener('submit', (e) => {
  e.preventDefault();
  const r = Calc.validar(dados(inv, ['capital', 'prazo', 'taxa']));
  erros(inv, r.erros);
  if (!r.ok) { $('#inv-res').hidden = true; $('#inv-st').textContent = ''; return; }
  const X = Calc.investir(r.v.capital, r.v.taxa / 100, r.v.prazo);
  $('#inv-kpi').innerHTML = kpi('Saldo bruto final', brl(X.final)) + kpi('Rendimento bruto acumulado', brl(X.rend)) + kpi('Capital inicial', brl(X.capital)) + kpi('Total de meses', X.meses) + kpi('Taxa informada', pct(r.v.taxa));
  grafico($('#g-inv'), [{ nome: 'Saldo', cor: '#22d3c5', d: [X.capital, ...X.linhas.map((l) => l.fim)] }], ['Início', 'Mês ' + X.meses]);
  $('#inv-tab').innerHTML = tabela(['Mês', 'Saldo inicial', 'Rendimento do mês', 'Saldo final'], X.linhas.map((l) => [l.k, brl(l.ini), brl(l.r), brl(l.fim)]));
  $('#inv-res').hidden = false; $('#inv-st').textContent = '✔ Cálculo concluído. Altere os valores e calcule de novo para comparar.';
});
inv.addEventListener('reset', () => { erros(inv, {}); $('#inv-res').hidden = true; $('#inv-st').textContent = ''; });

/* ---------- Conteúdo educativo (sem taxas fixas) ---------- */
const COND = 'Depende do produto, da instituição emissora e das regras vigentes.';
const RF = [
  ['Poupança', 'Depósito em banco que rende por regra definida em lei, com data de "aniversário" mensal.', 'Regra legal; não depende de negociação com o banco.', 'Liquidez alta; rende por completo a cada aniversário.', 'Baixo risco de perda do capital; costuma render menos que outras opções.', 'Em geral isenta de IR para pessoa física (confirme a regra vigente).', 'Sim, dentro dos limites do FGC.'],
  ['CDB', 'Certificado de Depósito Bancário: você empresta dinheiro ao banco e recebe de volta com remuneração.', 'Prefixada, pós-fixada (ex.: % do CDI) ou híbrida. ' + COND, 'Varia: há CDBs com resgate diário e outros só no vencimento.', 'Risco de crédito do banco emissor; resgate antecipado pode ser limitado.', 'IR regressivo sobre o rendimento e possível IOF em resgates muito curtos.', 'Sim, dentro dos limites do FGC.'],
  ['LCI', 'Letra de Crédito Imobiliário: título de banco ligado ao financiamento imobiliário.', 'Prefixada, pós-fixada ou híbrida. ' + COND, 'Em geral com prazo mínimo de carência.', 'Risco de crédito do emissor; menos flexível para resgate.', 'Historicamente isenta de IR para pessoa física; confirme a regra atual.', 'Sim, dentro dos limites do FGC.'],
  ['LCA', 'Letra de Crédito do Agronegócio: título de banco ligado ao financiamento do agronegócio.', 'Prefixada, pós-fixada ou híbrida. ' + COND, 'Em geral com prazo mínimo de carência.', 'Risco de crédito do emissor; menos flexível para resgate.', 'Historicamente isenta de IR para pessoa física; confirme a regra atual.', 'Sim, dentro dos limites do FGC.'],
  ['Tesouro Selic', 'Título público pós-fixado: você empresta ao governo federal.', 'Acompanha a taxa Selic, mais um eventual ágio ou deságio da compra.', 'Resgate possível em dias úteis, pelo preço do dia.', 'Baixo risco de crédito; pequena oscilação se vendido antes do vencimento.', 'IR regressivo, IOF em resgates curtos e taxa de custódia da B3.', 'Não. A garantia é do Tesouro Nacional, não do FGC.'],
  ['Tesouro Prefixado', 'Título público com taxa definida no momento da compra.', 'Taxa fixa contratada; o valor final é conhecido se mantido até o vencimento.', 'Venda antes do vencimento a preço de mercado, que pode ser menor.', 'Marcação a mercado: se os juros sobem, o preço cai e pode haver perda.', 'IR regressivo, IOF em resgates curtos e taxa de custódia da B3.', 'Não. A garantia é do Tesouro Nacional, não do FGC.'],
  ['Tesouro IPCA+', 'Título público que combina inflação (IPCA) com uma taxa fixa.', 'IPCA mais taxa definida na compra, o que ajuda a preservar o poder de compra no longo prazo.', 'Venda antes do vencimento a preço de mercado.', 'Marcação a mercado: o preço oscila e pode haver perda se vender antes.', 'IR regressivo, IOF em resgates curtos e taxa de custódia da B3.', 'Não. A garantia é do Tesouro Nacional, não do FGC.'],
];
const RV = [
  ['Ações', 'Pequenas partes do capital de uma empresa. O investidor passa a ser sócio.', 'Valorização do preço e possíveis dividendos, que não são garantidos.', 'Compra e venda na bolsa em dias úteis, ao preço de mercado.', 'Preços oscilam e existe possibilidade de perdas, inclusive do valor investido.', 'Regras próprias para ganhos nas vendas e para proventos. Consulte a Receita Federal.', 'Não há cobertura do FGC.'],
  ['Fundos imobiliários (FIIs)', 'Cotas de fundos que investem em imóveis ou títulos do setor imobiliário.', 'Valorização das cotas e rendimentos periódicos, que não são garantidos.', 'Cotas negociadas na bolsa, ao preço de mercado.', 'Cotas oscilam, rendimentos podem cair e há possibilidade de perdas.', 'Regras próprias para rendimentos e ganhos. Consulte a Receita Federal.', 'Não há cobertura do FGC.'],
];
const cartao = (c) => `<article class="card"><h3>${c[0]}</h3><dl><dt>O que é e como funciona</dt><dd>${c[1]}</dd><dt>Remuneração</dt><dd>${c[2]}</dd><dt>Liquidez e prazo</dt><dd>${c[3]}</dd><dt>Principais riscos</dt><dd>${c[4]}</dd><dt>Tributação</dt><dd>${c[5]}</dd><dt>FGC</dt><dd>${c[6]}</dd></dl></article>`;
$('#rf').innerHTML = RF.map(cartao).join(''); $('#rv').innerHTML = RV.map(cartao).join('');
