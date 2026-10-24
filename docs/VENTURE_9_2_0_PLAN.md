# Venture 9.2.0 — plano de implementação

## Objetivo
Adicionar notificações internas, preparar Web Push, apresentar badges Big Mac para as dez ligas mensais e abrir uma trilha preparatória All Star, mantendo o ranking geral e os saldos de XP.

## Entregas nesta branch
- Recriação dos módulos js/10-arena-venture.js e js/11-ligas-mensais.js, que eram referenciados no index.html da base 9.1.0, mas não estavam presentes no repositório.
- Ledger de XP no cadastro existente com IDs de recompensa, marcações pendentes/aplicadas e união de registros na mesclagem local.
- Ligas Bronze, Prata, Ouro, Safira, Rubi, Esmeralda, Ametista, Pérola, Obsidiana e Diamante; XP mensal separado do XP vitalício.
- Botão administrativo para fechar a temporada anterior depois de encerrado o mês. O fechamento é manual e depende do conjunto de jogadores sincronizado no aparelho do administrador.
- Centro de notificações interno, contador de não lidas, avisos de temporada/conquista e composer de comunicados globais para administrador.
- Service worker para receber eventos Push e manifest PWA. O envio real com site fechado não funciona até configurar backend de envio, VAPID e armazenamento seguro de inscrições.
- Badges de liga com ícone de hambúrguer no perfil pessoal, perfil público e ranking mensal.
- Hub preparatório All Star com trilhas de Balcão/Atendimento, Drive-Thru, Cozinha e Sobremesas/Quiosque.
- Documentação de testes e configuração de push.

## Calendário inicial
- Pré-temporada: até 31/10/2026.
- Primeira temporada mensal: 01/11/2026 a 30/11/2026.
- O fechamento de novembro poderá ser executado pelo administrador em dezembro, depois de conferir a sincronização.
- Nenhum XP vitalício será zerado no fechamento mensal.

## Regras de liga
- Cada cadastro começa na Liga Bronze, sem alteração do XP acumulado.
- A pontuação mensal soma apenas entradas aplicadas do ledger dentro do mês local do dispositivo.
- Só participantes com XP positivo entram nas zonas de promoção/rebaixamento.
- Para evitar movimentos com poucos participantes, a divisão precisa ter pelo menos cinco participantes ativos.
- O administrador fecha a temporada anterior manualmente. A classificação é calculada com os registros disponíveis no aparelho e sincronizados pelo sistema legado; ainda não é um resultado autoritativo de servidor.

## Limites e riscos conhecidos
- O site continua usando sincronização legada via MQTT/HTTP. O ledger por ID reduz duplicações e facilita a reconciliação, mas não garante transações exactly-once entre aparelhos simultâneos.
- O fechamento mensal é manual para evitar que cada aparelho finalize a temporada de forma independente.
- Avisos internos são persistidos no cadastro e podem ser propagados pela sincronização atual. A entrega depende de os dispositivos sincronizarem.
- A permissão do navegador e o service worker podem ser preparados gratuitamente. Push confiável com o site fechado exige endpoint de backend, VAPID e armazenamento/gestão de inscrições; não há chaves nem backend de envio incluídos no repositório.
- O All Star aqui é uma trilha de preparação independente, não uma integração oficial com sistemas internos da Arcos Dorados/McDonald's e não concede classificação oficial.

## Referências consultadas sobre All Star
- Correio Jaguariúna, etapa final de 11/09/2026: https://correiojaguariuna.com.br/loja-mcdonalds-de-jaguariuna-recebe-etapa-final-da-competicao-all-star-no-dia-11-de-setembro/
- O Regional, etapa regional de 08/01/2026: https://oregional.net/unidade-do-mcdonalds-de-jaguariuna-recebe-etapa-regional-da-competicao-all-star-192263
- App McDonald's AllStar (Arcos Dorados), descrição do programa: https://apps.apple.com/br/app/mcdonalds-allstar/id1399163652
