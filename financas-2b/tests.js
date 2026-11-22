// Executa: node tests.js  -> roda os testes e grava TESTES.md com os resultados reais.
const C = require('./calc.js'), fs = require('fs');
const lin = []; let falhas = 0;
const c = (n) => (n / 100).toFixed(2).replace('.', ',');
function t(nome, esperado, obtido, tol = 0) {
  const ok = typeof esperado === 'number' ? Math.abs(esperado - obtido) <= tol : esperado === obtido;
  if (!ok) falhas++;
  lin.push(`| ${nome} | ${typeof esperado === 'number' ? c(esperado) : esperado} | ${typeof obtido === 'number' ? c(obtido) : obtido} | ${ok ? 'OK' : 'FALHOU'} |`);
}
const S = C.financiar(10000, 0.02, 10, 'SAC'), P = C.financiar(10000, 0.02, 10, 'PRICE');
t('T1 SAC amortização mensal', 100000, S.linhas[0].a); t('T1 SAC 1ª prestação', 120000, S.primeira);
t('T1 SAC última prestação', 102000, S.ultima); t('T1 SAC juros totais', 110000, S.juros);
t('T1 SAC total pago', 1110000, S.total); t('T1 SAC saldo final', 0, S.linhas[9].fim);
t('T2 PRICE prestação (tol. 1 centavo)', 111326, P.linhas[0].p, 1); t('T2 PRICE juros totais (tol. 15 centavos)', 113260, P.juros, 15);
t('T2 PRICE total pago (tol. 15 centavos)', 1113260, P.total, 15); t('T2 PRICE saldo final', 0, P.linhas[9].fim);
for (const s of ['SAC', 'PRICE']) {
  const Z = C.financiar(10000, 0, 10, s);
  t(`T3 ${s} taxa zero: parcela`, 100000, Z.primeira); t(`T3 ${s} taxa zero: juros`, 0, Z.juros); t(`T3 ${s} taxa zero: total`, 1000000, Z.total);
}
const I1 = C.investir(10000, 0.01, 12), I2 = C.investir(1000, 0.01, 12), I3 = C.investir(5000, 0, 12);
t('T4 saldo final', 1126825, I1.final); t('T4 rendimento', 126825, I1.rend);
t('T5 saldo final', 112683, I2.final); t('T5 rendimento', 12683, I2.rend);
t('T6 saldo final (taxa 0)', 500000, I3.final); t('T6 rendimento (taxa 0)', 0, I3.rend);
// Teste 7: validação (campo e entrada -> deve haver erro)
const inv = [['campo vazio', { valor: '', taxa: '1', parcelas: '10' }], ['taxa negativa', { valor: '100', taxa: '-1', parcelas: '10' }],
  ['capital negativo', { capital: '-100', prazo: '12', taxa: '1' }], ['prazo zero', { capital: '100', prazo: '0', taxa: '1' }],
  ['parcelas decimal', { valor: '100', taxa: '1', parcelas: '2,5' }], ['letras', { valor: 'abc', taxa: '1', parcelas: '10' }],
  ['valor zero', { valor: '0', taxa: '1', parcelas: '10' }]];
for (const [n, d] of inv) t('T7 ' + n + ' bloqueado', 'bloqueado', C.validar(d).ok ? 'ACEITO' : 'bloqueado');
t('T7 taxa zero aceita', 'aceita', C.validar({ valor: '1000', taxa: '0', parcelas: '5' }).ok ? 'aceita' : 'recusada');
t('Formato 10.000,50 aceito', 1000050, Math.round(C.num('10.000,50') * 100));
const saldoNeg = ['SAC', 'PRICE'].some((s) => [0.5, 3.7, 12].some((tx) => C.financiar(9999.99, tx / 100, 37, s).linhas.some((l) => l.fim < 0 || l.fim > 999999)));
t('Saldo nunca negativo (varias taxas, 37 parcelas)', 'sim', saldoNeg ? 'nao' : 'sim');
const md = `# Testes realizados\n\nGerado automaticamente por \`node tests.js\` em ${new Date().toISOString().slice(0, 10)}. Valores em R$ (os testes 7 e de formato comparam texto).\n\n| Teste | Esperado | Obtido | Resultado |\n|---|---|---|---|\n${lin.join('\n')}\n\n**${lin.length - falhas} de ${lin.length} verificações passaram.**\n\n## Observações\n- PRICE: o PMT exato é 1.113,2654; arredondado ao centavo fica 1.113,27. O 1.113,26 do planejamento é o valor truncado, por isso a tolerância de 1 centavo. A última parcela é ajustada para zerar o saldo.\n- Estes testes cobrem apenas as funções de cálculo e validação (calc.js). O visual, as mensagens de erro na tela, o menu mobile e os gráficos devem ser conferidos manualmente em um navegador e em um celular.\n`;
fs.writeFileSync(__dirname + '/TESTES.md', md); console.log(md); process.exit(falhas ? 1 : 0);
