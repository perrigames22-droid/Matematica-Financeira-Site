/* calc.js - cálculos e validações (sem DOM). Dinheiro em CENTAVOS (inteiros) para evitar erros de arredondamento. */
const Calc = (() => {
  const R = Math.round, soma = (l, k) => l.reduce((t, x) => t + x[k], 0);

  // Converte texto em número. Aceita "10.000,50" e "10000.50". null = vazio, NaN = inválido.
  function num(t) {
    let s = String(t ?? '').trim().replace(/R\$|%|\s/g, '');
    if (s === '') return null;
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    return /^-?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : NaN;
  }

  const regras = {
    valor: { min: 0.01, max: 1e9 }, capital: { min: 0.01, max: 1e9 },
    taxa: { zero: true, min: 0, max: 100 },
    parcelas: { int: true, min: 1, max: 600 }, prazo: { int: true, min: 1, max: 600 },
  };

  function valida(t, o) {
    const v = num(t);
    if (v === null) return { erro: 'Preencha este campo.' };
    if (Number.isNaN(v)) return { erro: 'Digite apenas números (ex.: 1500,50).' };
    if (v < 0) return { erro: 'Não use valores negativos.' };
    if (v === 0 && !o.zero) return { erro: 'O valor deve ser maior que zero.' };
    if (o.int && !Number.isInteger(v)) return { erro: 'Use um número inteiro, sem casas decimais.' };
    if (v < o.min) return { erro: 'Valor mínimo: ' + o.min + '.' };
    if (v > o.max) return { erro: 'Valor máximo: ' + o.max.toLocaleString('pt-BR') + '.' };
    return { v };
  }

  // dados = { campo: texto } -> { ok, erros, v }
  function validar(dados) {
    const erros = {}, v = {};
    for (const k in dados) { const r = valida(dados[k], regras[k]); r.erro ? (erros[k] = r.erro) : (v[k] = r.v); }
    return { ok: !Object.keys(erros).length, erros, v };
  }

  // Financiamento. pv em reais, i decimal (2% = 0.02), n parcelas, sis 'SAC' | 'PRICE'.
  function financiar(pv, i, n, sis) {
    let saldo = R(pv * 100);
    const pmt = i === 0 ? 0 : R(saldo * i / (1 - Math.pow(1 + i, -n))); // PMT = PV·i / [1-(1+i)^-n]
    const am = R(saldo / n), linhas = [];
    for (let k = 1; k <= n; k++) {
      const ini = saldo, j = R(ini * i); // Juros = saldo inicial × taxa
      let a;
      if (k === n) a = ini; // última parcela quita o saldo (ajuste de centavos)
      else if (sis === 'SAC' || i === 0) a = Math.min(am, ini); // SAC: amortização = PV/n
      else a = Math.min(Math.max(pmt - j, 0), ini); // PRICE: amortização = PMT - juros
      saldo = ini - a;
      linhas.push({ k, ini, j, a, p: a + j, fim: saldo });
    }
    return { linhas, primeira: linhas[0].p, ultima: linhas[n - 1].p, juros: soma(linhas, 'j'), total: soma(linhas, 'p'), amort: soma(linhas, 'a') };
  }

  // Juros compostos: M = C·(1+i)^n. Cada mês = C·(1+i)^k arredondado em centavos.
  function investir(c, i, n) {
    const C = R(c * 100), linhas = []; let ant = C;
    for (let k = 1; k <= n; k++) { const s = R(C * Math.pow(1 + i, k)); linhas.push({ k, ini: ant, r: s - ant, fim: s }); ant = s; }
    return { linhas, capital: C, meses: n, final: ant, rend: ant - C };
  }

  const brl = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pct = (p) => p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '% ao mês';
  return { num, validar, financiar, investir, brl, pct };
})();
if (typeof module !== 'undefined') module.exports = Calc;
