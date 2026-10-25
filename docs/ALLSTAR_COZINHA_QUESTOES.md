# Venture All Star — Cozinha (versão inicial)

## Escopo
O módulo `js/13-allstar.js` adiciona treinamento guiado e prova competitiva para Linha, Chapas e Carnes, McFritas e Produtos Fritos. O resultado é armazenado em `user.ventureAllStar` e não concede, remove nem recalcula XP oficial.

## Fontes usadas nas questões
As questões abaixo foram transcritas/parafraseadas apenas a partir dos dois PDFs fornecidos pelo usuário. O aplicativo mostra a fonte e a página no treinamento e na revisão final da competição.

### Linha — Material de Estudo — Produção Linha
- LIN-01: lavagem de mãos e antebraços por 20 segundos — p. 2.
- LIN-02: tostadeira rápida, 293°C, compressão 5D, ciclo de 22 segundos — p. 2.
- LIN-03: tostadeira HEBT5V, 275°C, compressão 5, ciclo de 22 segundos — p. 2.
- LIN-04: tempo de reação do Iniciador de 3 a 5 segundos — p. 2.
- LIN-05: tempo de linha de 35 a 50 segundos — p. 2.
- LIN-06: iniciar nova rodada quando houver novo pedido sem esperar o fim do ciclo de caramelização — p. 3.

### Chapas e carnes — Material de Estudo — Produção Linha
- CHA-01: temperaturas indicadas de chapa inferior/superior — p. 4.
- CHA-02: máximo de carnes por platen conforme os tipos 10:1, 4:1 e 3:1 — p. 4.
- CHA-03: tempos de remoção conforme tipo de carne — p. 4.
- CHA-04: quatro panos e suas finalidades — p. 4.
- CHA-05: utensílios a manter à mão quando o timer soar aos 5 segundos — p. 5.
- CHA-06: organização das carnes 10:1 nas gavetas — p. 5.

### Chapas e carnes — Guia de Implementação BB VF 2025
- CHA-07: separação aproximada de 1 cm entre carnes — p. 58.
- CHA-08: cozinhar no mínimo duas carnes por vez — p. 58.

### McFritas — Material de Estudo — Produção Linha
- FRI-01: temperatura da fritadeira — p. 7.
- FRI-02: tempo programado de fritura e Duty — p. 7.
- FRI-03: tempos de vida no congelador portátil e encestador automático — p. 7–8.
- FRI-04: ação ao soar o timer do Duty — p. 8.
- FRI-05: tempo de escorrimento do óleo — p. 8.
- FRI-06: aplicação de sal (quantidade, altura e movimento) — p. 8.

### Produtos fritos — Material de Estudo — Produção Linha
- PFR-01: temperatura das fritadeiras para frango e tortas — p. 9.
- PFR-02: tempos de fritura programados — p. 9.
- PFR-03: tempos de validade na UHC de McChicken, McNuggets e McJunior — p. 9.
- PFR-04: resfriamento e tempo total de vida das tortas — p. 9–10.
- PFR-05: posição das tortas no cesto — p. 10.
- PFR-06: pegador indicado para frango e exceção expressa para McNuggets — p. 9–10.

## Proveniência das questões e padrão de UHC

As 26 questões desta primeira versão são questões didáticas autorais, parafraseadas a partir dos dois PDFs fornecidos. Elas não são transcrições do book oficial e não foram validadas página a página contra esse book. Para uma versão rigorosamente alinhada ao book, é necessário conferir o documento oficial e mapear cada questão à página correta.

### UHC de carnes vermelhas
- Padrão adotado no treinamento: **79°C e tempo máximo de vida de 10 minutos**, conforme correção expressa do responsável pelo conteúdo e referência disponível no `Guia de Implementação BB VF 2025.pdf` (p. 66).
- O `Material de Estudo — Produção Linha.pdf` (p. 4) contém valores conflitantes: 85°C e 15 minutos.
- O Venture não deve usar os valores conflitantes do material de estudo para esse parâmetro. A página oficial de referência ainda deve ser confirmada no book oficial, caso seja um documento distinto do guia fornecido.

## Regras da experiência
- Treinamento: feedback imediato, resposta correta, explicação e fonte/página após responder.
- Competição: sorteio de até 10 questões, sem revelar fonte nem gabarito antes de finalizar.
- Ao concluir, o usuário recebe percentual, revisão completa e histórico por estação.
- Meta sugerida de 80% é apenas uma referência do simulado Venture, não certificação oficial.
- Nenhuma atividade All Star concede XP oficial.
- Histórico local do usuário é limitado aos últimos 30 resultados para evitar crescimento ilimitado do cadastro.

## Limitações da versão inicial
- As questões cobrem apenas os tópicos documentados acima; não representam a totalidade dos procedimentos da cozinha.
- O histórico usa o cadastro existente e a sincronização legada do Venture. Conflitos simultâneos entre aparelhos ainda dependem de validação no backend.
- Esta experiência é uma ferramenta de estudo independente, não um sistema oficial de classificação da Arcos Dorados/McDonald's.
