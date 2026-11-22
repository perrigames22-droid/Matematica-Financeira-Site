# Testes realizados

Gerado automaticamente por `node tests.js` em 2026-11-22. Valores em R$ (os testes 7 e de formato comparam texto).

| Teste | Esperado | Obtido | Resultado |
|---|---|---|---|
| T1 SAC amortização mensal | 1000,00 | 1000,00 | OK |
| T1 SAC 1ª prestação | 1200,00 | 1200,00 | OK |
| T1 SAC última prestação | 1020,00 | 1020,00 | OK |
| T1 SAC juros totais | 1100,00 | 1100,00 | OK |
| T1 SAC total pago | 11100,00 | 11100,00 | OK |
| T1 SAC saldo final | 0,00 | 0,00 | OK |
| T2 PRICE prestação (tol. 1 centavo) | 1113,26 | 1113,27 | OK |
| T2 PRICE juros totais (tol. 15 centavos) | 1132,60 | 1132,65 | OK |
| T2 PRICE total pago (tol. 15 centavos) | 11132,60 | 11132,65 | OK |
| T2 PRICE saldo final | 0,00 | 0,00 | OK |
| T3 SAC taxa zero: parcela | 1000,00 | 1000,00 | OK |
| T3 SAC taxa zero: juros | 0,00 | 0,00 | OK |
| T3 SAC taxa zero: total | 10000,00 | 10000,00 | OK |
| T3 PRICE taxa zero: parcela | 1000,00 | 1000,00 | OK |
| T3 PRICE taxa zero: juros | 0,00 | 0,00 | OK |
| T3 PRICE taxa zero: total | 10000,00 | 10000,00 | OK |
| T4 saldo final | 11268,25 | 11268,25 | OK |
| T4 rendimento | 1268,25 | 1268,25 | OK |
| T5 saldo final | 1126,83 | 1126,83 | OK |
| T5 rendimento | 126,83 | 126,83 | OK |
| T6 saldo final (taxa 0) | 5000,00 | 5000,00 | OK |
| T6 rendimento (taxa 0) | 0,00 | 0,00 | OK |
| T7 campo vazio bloqueado | bloqueado | bloqueado | OK |
| T7 taxa negativa bloqueado | bloqueado | bloqueado | OK |
| T7 capital negativo bloqueado | bloqueado | bloqueado | OK |
| T7 prazo zero bloqueado | bloqueado | bloqueado | OK |
| T7 parcelas decimal bloqueado | bloqueado | bloqueado | OK |
| T7 letras bloqueado | bloqueado | bloqueado | OK |
| T7 valor zero bloqueado | bloqueado | bloqueado | OK |
| T7 taxa zero aceita | aceita | aceita | OK |
| Formato 10.000,50 aceito | 10000,50 | 10000,50 | OK |
| Saldo nunca negativo (varias taxas, 37 parcelas) | sim | sim | OK |

**32 de 32 verificações passaram.**

## Observações
- PRICE: o PMT exato é 1.113,2654; arredondado ao centavo fica 1.113,27. O 1.113,26 do planejamento é o valor truncado, por isso a tolerância de 1 centavo. A última parcela é ajustada para zerar o saldo.
- Estes testes cobrem apenas as funções de cálculo e validação (calc.js). O visual, as mensagens de erro na tela, o menu mobile e os gráficos devem ser conferidos manualmente em um navegador e em um celular.
