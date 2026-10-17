/* =========================================================================
   OLIMPÍADAS DO BÁSICO — VENTURE (script.js v7.9 100% UNIFICADO & COMPLETO)
   Finalização 25/10 + Cozinha 5 XP + Sons + Fotos + Print + 1v1 + 200 Questões
   ========================================================================= */

const $ = id => document.getElementById(id);
const AVATAR_LIST = ["🍔", "🍟", "🍦", "🔥", "👨‍🍳", "👑", "⚡", "🏆", "🚀", "🥤", "🥓", "🎯"];
let selectedRegAvatar = "🍔";

// Data Oficial de Encerramento: 25/10/2026 às 23:59:59
const EVENT_END_TIMESTAMP = new Date("2026-10-25T23:59:59-03:00").getTime();

// RECEITAS OFICIAIS DO SISTEMA DE COZINHA (MONTA-LANCHE) — 5 XP
const KITCHEN_RECIPES = [
  {
    id: "smokehouse1", name: "🥓 Brabo SmokeHouse (1 Carne)", xp: 5,
    steps: ["Coroa Pão Brioche", "Molho Méquinese (1 oz)", "Cebola Crispy (10 g)", "Bacon em Tiras (3 fatias)", "Queijo Cheddar (1 fatia)", "Carne 4:1 (1 unidade)", "Queijo Cheddar (1 fatia)", "Bacon Triturado (10 g)", "Geleia Agridoce Defumada (2/3 oz)", "Base Pão Brioche"]
  },
  {
    id: "smokehouse2", name: "🔥 Brabo SmokeHouse (2 Carnes)", xp: 5,
    steps: ["Coroa Pão Brioche", "Molho Méquinese (1 oz)", "Cebola Crispy (10 g)", "Bacon em Tiras (3 fatias)", "Queijo Cheddar (1 fatia)", "Carne 4:1 (2 unidades)", "Queijo Cheddar (1 fatia)", "Bacon Triturado (10 g)", "Geleia Agridoce Defumada (2/3 oz)", "Base Pão Brioche"]
  },
  {
    id: "bigmac", name: "🍔 Big Mac Oficial", xp: 5,
    steps: ["Pão Big Mac (Base + Club + Coroa)", "Molho Big Mac (1/2 oz Base + 1/2 oz Club)", "Alface (12 g Base + 12 g Club = 24 g)", "Picles (2 fatias no Club)", "Queijo Cheddar (1 fatia na Base)", "2 Carnes 10:1 c/ Cebola (3,5 g)"]
  },
  {
    id: "quarteirao", name: "🧀 Quarteirão com Queijo", xp: 5,
    steps: ["Pão Quarteirão (Coroa e Base)", "Mostarda (1/40 oz)", "Ketchup (1/2 oz)", "Cebola Fresca (7 g)", "Picles (2 fatias)", "2 Queijos Cheddar em Estrela", "1 Carne 4:1"]
  },
  {
    id: "cheeseburger", name: "🍔 Cheeseburger Padrão", xp: 5,
    steps: ["Pão Regular (Coroa e Base)", "Mostarda (1/40 oz)", "Ketchup (1/3 oz)", "Picles (1 fatia)", "Queijo Cheddar (1 fatia)", "1 Carne 10:1 c/ 3,5 g Cebola"]
  },
  {
    id: "mcnifico", name: "🥓 McNífico Bacon", xp: 5,
    steps: ["Mostarda (1/40 oz) + Ketchup (1/2 oz)", "Cebola Fresca (7 g)", "Molho Maionese (2/3 oz)", "Alface (28 g) + 2 Tomates", "2 Fatias de Bacon + 1 Queijo Cheddar", "1 Carne 4:1"]
  },
  {
    id: "bigtasty", name: "👑 Big Tasty", xp: 5,
    steps: ["Molho Tasty (1 oz Coroa + 1 oz Base)", "Cebola Fresca (10 g)", "Alface (28 g) + 2 Tomates", "3 Queijos Ementhal", "Carne 4:1 (Destacando a TAG)"]
  }
];

// BANCO OFICIAL DE 200 QUESTÕES — BOOK VENTURE
const QUESTIONS_DB = [
  { id: 1, level: "Básico", q: "Quantas gramas de alface colocamos no BigMac?", a: "12 gr na base e 12 gr no clube, totalizando 24 gramas.", w: ["14 gr na base e 14 gr no clube, totalizando 28 gramas.", "10 gr na base e 10 gr no clube, totalizando 20 gramas.", "15 gr na base e 15 gr no clube, totalizando 30 gramas."] },
  { id: 2, level: "Básico", q: "Quantas gramas de alface colocamos no McChicken?", a: "28 gramas de alface.", w: ["24 gramas de alface.", "30 gramas de alface.", "14 gramas de alface."] },
  { id: 3, level: "Básico", q: "Quantas gramas (oz) de molho vai no Big Tasty?", a: "1 oz na coroa e 1 oz na base, totalizando 2 oz.", w: ["1/2 oz na coroa e 1/2 oz na base, totalizando 1 oz.", "2/3 oz na coroa e 2/3 oz na base, totalizando 4/3 oz.", "1 oz apenas na base, totalizando 1 oz."] },
  { id: 7, level: "Básico", q: "Por quanto tempo devemos lavar as mãos?", a: "20 segundos.", w: ["15 segundos.", "30 segundos.", "45 segundos."] },
  { id: 8, level: "Básico", q: "Qual o primeiro passo na lavagem das mãos?", a: "Molhar as mãos.", w: ["Aplicar sabonete bactericida.", "Esfregar as palmas por 20s.", "Sanitizar com solução clorada."] },
  { id: 9, level: "Básico", q: "Qual a frequência correta para lavagem das mãos?", a: "A cada 1 hora.", w: ["A cada 30 minutos.", "A cada 2 horas.", "A cada 45 minutos."] },
  { id: 10, level: "Básico", q: "Quais são os EPIs necessários para atuar na estação de chapa?", a: "Avental e mangote.", w: ["Avental, luva de malha e óculos.", "Mangote, luva térmica azul e touca.", "Avental antichamas e bota de borracha."] },
  { id: 11, level: "Básico", q: "Cite bons padrões de higiene essenciais para o trabalho no McDonald's.", a: "Cabelos presos, unhas curtas, sem esmalte e limpas, barba feita, sem adornos e com redinha.", w: ["Cabelos presos, unhas com base incolor, barba aparada, relógio discreto e redinha.", "Cabelos presos, unhas curtas, uso permitido apenas de aliança lisa e barba feita.", "Cabelos com boné sem redinha, unhas curtas, sem esmalte e brinco pequeno."] },
  { id: 12, level: "Básico", q: "Qual a compressão do pão e tempo de tostagem da tostadeira?", a: "Compressão 4, tempo de tostagem 22 segundos.", w: ["Compressão 3, tempo de tostagem 18 segundos.", "Compressão 4, tempo de tostagem 17 segundos.", "Compressão 5, tempo de tostagem 25 segundos."] },
  { id: 13, level: "Básico", q: "Qual a temperatura das UHCs de carnes vermelhas e brancas respectivamente?", a: "Carnes vermelhas 79°C e carnes brancas 85°C.", w: ["Carnes vermelhas 85°C e carnes brancas 79°C.", "Carnes vermelhas 74°C e carnes brancas 82°C.", "Carnes vermelhas 77°C e carnes brancas 90°C."] },
  { id: 14, level: "Básico", q: "Qual o tempo de vida das carnes vermelhas na UHC?", a: "10 minutos.", w: ["15 minutos.", "12 minutos.", "20 minutos."] },
  { id: 15, level: "Básico", q: "Qual o tempo das carnes brancas na UHC?", a: "Crispy 60 minutos, Chicken 30 minutos, Junior e Nuggets 20 minutos.", w: ["Crispy 45 minutos, Chicken 30 minutos, Junior e Nuggets 15 minutos.", "Crispy 60 minutos, Chicken 20 minutos, Junior e Nuggets 30 minutos.", "Crispy 30 minutos, Chicken 20 minutos, Junior e Nuggets 10 minutos."] },
  { id: 16, level: "Básico", q: "Qual o tempo de vida dos ceboleiros em área e quantos conseguimos fazer com 1 pacote de cebola?", a: "4 horas e 7 ceboleiros.", w: ["2 horas e 5 ceboleiros.", "4 horas e 5 ceboleiros.", "6 horas e 8 ceboleiros."] },
  { id: 17, level: "Básico", q: "Qual o tempo de reação do iniciador?", a: "De 3 a 5 segundos.", w: ["De 1 a 3 segundos.", "De 5 a 8 segundos.", "De 5 a 10 segundos."] },
  { id: 18, level: "Básico", q: "Qual pessoa da linha nunca pode sair da estação?", a: "A pessoa do iniciador.", w: ["A pessoa do finalizador.", "A pessoa da condimentação.", "A pessoa da chapa."] },
  { id: 19, level: "Básico", q: "A partir de quantos sanduíches produzidos na hora devemos abrir o lado 2?", a: "125 sanduíches na hora.", w: ["100 sanduíches na hora.", "150 sanduíches na hora.", "90 sanduíches na hora."] },
  { id: 20, level: "Básico", q: "Em qual direção devem ficar a base e a coroa dos pães na linha?", a: "Base sentido UHC e Coroa sentido tostadeira.", w: ["Base sentido tostadeira e Coroa sentido UHC.", "Base e Coroa sentido tostadeira.", "Base e Coroa sentido UHC."] },
  { id: 21, level: "Básico", q: "Quantos pães podemos ativar por vez na tostadeira?", a: "2 pães.", w: ["3 pães.", "4 pães.", "1 pão por vez."] },
  { id: 22, level: "Básico", q: "Quantos sanduíches podemos condimentar por vez?", a: "2 sanduíches.", w: ["3 sanduíches.", "4 sanduíches.", "1 sanduíche por vez."] },
  { id: 23, level: "Básico", q: "Quais as cores dos clipes das gavetas da UHC para McChicken e Nuggets?", a: "McChicken amarelo e Nuggets branco.", w: ["McChicken branco e Nuggets amarelo.", "McChicken verde e Nuggets azul.", "McChicken amarelo e Nuggets verde."] },
  { id: 24, level: "Básico", q: "Qual o tempo de vida do ceboleiro na estação de chapa?", a: "4 horas.", w: ["2 horas.", "6 horas.", "12 horas."] },
  { id: 25, level: "Básico", q: "Quantos panos devemos ter na linha?", a: "3 panos: 1 para tostadeira, 1 para mesa de condimentação e 1 para UHC.", w: ["4 panos: 2 para mesa, 1 para tostadeira e 1 para UHC.", "2 panos: 1 para mesa e 1 para tostadeira.", "3 panos: 2 para utensílios e 1 para mesa."] },
  { id: 26, level: "Básico", q: "Em quantos pedaços devemos cortar a carne de Crispy da Salada Mix?", a: "De 5 a 7 pedaços.", w: ["De 4 a 6 pedaços.", "De 6 a 8 pedaços.", "Em 4 pedaços iguais."] },
  { id: 27, level: "Básico", q: "Por quanto tempo o tomate deve ficar no sanitizante?", a: "15 minutos.", w: ["10 minutos.", "20 minutos.", "5 minutos."] },
  { id: 28, level: "Básico", q: "Por quanto tempo o tomate deve ficar em ambientação antes de ser cortado?", a: "2 horas.", w: ["1 hora.", "3 horas.", "4 horas."] },
  { id: 29, level: "Básico", q: "Qual o tempo de vida do tomate após ser cortado?", a: "2 horas.", w: ["4 horas.", "1 hora.", "3 horas."] },
  { id: 30, level: "Básico", q: "Qual o tempo de ambientação dos molhos Cheddar do Sanduíche e da Batata respectivamente?", a: "2 horas e 4 horas de ambientação.", w: ["4 horas e 2 horas de ambientação.", "2 horas e 2 horas de ambientação.", "1 hora e 3 horas de ambientação."] },
  { id: 31, level: "Básico", q: "Qual o tempo de vida do molho cheddar na pistola?", a: "2 horas de ambientação e 6 horas de tempo de vida, totalizando 8 horas.", w: ["4 horas de ambientação e 4 horas de uso, totalizando 8 horas.", "2 horas de ambientação e 4 horas de uso, totalizando 6 horas.", "1 hora de ambientação e 5 horas de uso, totalizando 6 horas."] },
  { id: 32, level: "Básico", q: "Quais quantidades de Molho Maionese colocamos nos sanduíches McChicken, McChicken Bacon, Chicken Jr e McNífico Bacon?", a: "2/3 oz de molho maionese.", w: ["1/2 oz de molho maionese.", "1 oz de molho maionese.", "1/3 oz de molho maionese."] },
  { id: 33, level: "Básico", q: "Qual quantidade de Molho colocamos no Big Mac?", a: "1 tiro de 1/2 oz de molho na base e 1 no club, totalizando 1 oz de molho Big Mac.", w: ["1 tiro de 1 oz na base e 1 no club, totalizando 2 oz.", "1 tiro de 1/3 oz na base e 1 no club, totalizando 2/3 oz.", "2 tiros de 1/2 oz apenas na base, totalizando 1 oz."] },
  { id: 34, level: "Básico", q: "Quais cores de pegadores temos na linha e qual a sua finalidade?", a: "Pegador vermelho para carnes vermelhas com cebola, azul para carnes vermelhas sem cebola, verde para carnes brancas.", w: ["Pegador azul para carnes com cebola, vermelho para sem cebola, verde para carnes brancas.", "Pegador vermelho para todas as carnes vermelhas, amarelo para frango e verde para saladas.", "Pegador preto para carnes com cebola, azul para sem cebola e bege para carnes brancas."] },
  { id: 35, level: "Básico", q: "Qual procedimento devemos seguir logo após ativar as carnes na chapa?", a: "Sanitizar as mãos.", w: ["Trocar o avental da estação.", "Raspar o platen imediatamente.", "Limpar a borda da UHC."] },
  { id: 36, level: "Básico", q: "Qual ferramenta define os níveis de carnes que devemos ter nas gavetas?", a: "PLS.", w: ["KVS.", "R2P.", "DFS."] },
  { id: 37, level: "Básico", q: "Qual o ângulo de raspagem da chapa?", a: "15°.", w: ["30°.", "45°.", "20°."] },
  { id: 38, level: "Básico", q: "Qual a forma correta de ativar, salgar e remover as carnes?", a: "Da direita para a esquerda, da frente para o fundo.", w: ["Da esquerda para a direita, do fundo para a frente.", "Da direita para a esquerda, do fundo para a frente.", "Da esquerda para a direita, da frente para o fundo."] },
  { id: 39, level: "Básico", q: "Qual o empilhamento máximo de carnes de 10:1 na gaveta?", a: "3 carnes.", w: ["4 carnes.", "2 carnes.", "6 carnes."] },
  { id: 40, level: "Básico", q: "Qual o empilhamento máximo de carnes de 4:1 na gaveta?", a: "1 carne, não podemos empilhar carnes de 4:1.", w: ["2 carnes por fileira na gaveta.", "3 carnes, igual à carne 10:1.", "Até 4 carnes empilhadas."] },
  { id: 41, level: "Básico", q: "Quantas carnes de 10:1 podemos ativar no máximo em cada platen?", a: "6 carnes.", w: ["8 carnes.", "4 carnes.", "9 carnes."] },
  { id: 42, level: "Básico", q: "Quantas carnes de 4:1 podemos ativar no máximo em cada platen?", a: "4 carnes.", w: ["6 carnes.", "2 carnes.", "8 carnes."] },
  { id: 43, level: "Básico", q: "Quantas carnes de 4:1 podemos colocar no máximo em cada gaveta?", a: "4 carnes.", w: ["6 carnes.", "8 carnes.", "12 carnes."] },
  { id: 44, level: "Básico", q: "Quantas carnes de 10:1 podemos colocar no máximo em cada gaveta?", a: "12 carnes.", w: ["9 carnes.", "15 carnes.", "18 carnes."] },
  { id: 45, level: "Básico", q: "Quantas fatias de bacon podemos ativar por vez em cada platen?", a: "6 fatias.", w: ["4 fatias.", "8 fatias.", "10 fatias."] },
  { id: 46, level: "Básico", q: "Qual pegador devemos usar para ativar as carnes brancas?", a: "Pegador preto.", w: ["Pegador verde.", "Pegador bege sem dentes.", "Pegador azul."] },
  { id: 47, level: "Básico", q: "Para que serve o pegador bege sem dentes nos produtos fritos?", a: "Para auxiliar a remoção das carnes dos cestos.", w: ["Para ativar os empanados congelados no óleo.", "Para montar os sanduíches de frango na linha.", "Para retirar as tortas da estufa."] },
  { id: 48, level: "Básico", q: "Quais as rodadas máximas para ativar carnes brancas e tortas?", a: "McChicken e Chicken Jr 6 carnes, Crispy 4 carnes, Nuggets 24 bolinhas e Tortas 16 unidades.", w: ["McChicken e Chicken Jr 8 carnes, Crispy 6 carnes, Nuggets 20 bolinhas e Tortas 12 unidades.", "McChicken e Chicken Jr 4 carnes, Crispy 4 carnes, Nuggets 30 bolinhas e Tortas 16 unidades.", "McChicken e Chicken Jr 6 carnes, Crispy 6 carnes, Nuggets 16 bolinhas e Tortas 8 unidades."] },
  { id: 49, level: "Básico", q: "Qual o tempo de resfriamento das tortas?", a: "20 minutos.", w: ["15 minutos.", "10 minutos.", "30 minutos."] },
  { id: 50, level: "Básico", q: "Qual o tempo de fritura das tortas?", a: "6 minutos.", w: ["3 minutos e 15 segundos.", "5 minutos.", "8 minutos."] },
  { id: 51, level: "Básico", q: "Qual o tempo de vida das tortas prontas?", a: "2 horas.", w: ["4 horas.", "1 hora.", "90 minutos."] },
  { id: 52, level: "Básico", q: "Quais os dois sistemas de ativada que podemos usar nos produtos fritos?", a: "Manutenção e Recuperação.", w: ["Ativação Contínua e Lote Máximo.", "Produção Direta e Garagem.", "Preventiva e Corretiva."] },
  { id: 53, level: "Básico", q: "Por quanto tempo as carnes devem escorrer sobre o óleo antes de ir para a gaveta?", a: "5 a 10 segundos.", w: ["10 a 15 segundos.", "3 a 5 segundos.", "15 a 20 segundos."] },
  { id: 54, level: "Básico", q: "Quais EPIs a pessoa do LOPE deve usar para acessar as câmaras?", a: "Casaco, Calça, Bota, Touca (balaclava) e luvas.", w: ["Avental térmico, mangote, bota e redinha.", "Casaco térmico, óculos, avental e luva de borracha.", "Jaqueta térmica, luva de malha de aço e sapato comum."] },
  { id: 55, level: "Básico", q: "Qual a temperatura da câmara de resfriados, Walk-in?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De 0 a 5°C.", "De 2 a 8°C."] },
  { id: 56, level: "Básico", q: "Qual a temperatura da câmara de congelados, Chicago?", a: "De -18 a -23°C.", w: ["De -10 a -15°C.", "De -15 a -20°C.", "De -22 a -28°C."] },
  { id: 57, level: "Básico", q: "Por quanto tempo o queijo deve ambientar antes de ser estocado na mesa de condimentação?", a: "2 horas.", w: ["1 hora.", "3 horas.", "4 horas."] },
  { id: 58, level: "Básico", q: "Qual a temperatura do queijo após a ambientação de 2 horas?", a: "De 15° a 18°C, ideal 17,5°C.", w: ["De 10° a 14°C, ideal 12,5°C.", "De 18° a 22°C, ideal 20°C.", "De 12° a 16°C, ideal 15°C."] },
  { id: 59, level: "Básico", q: "Como sabemos quantos queijos devemos ambientar para cada hora?", a: "Usando a tabela chart, para saber quantos queijos vamos usar de acordo com as GCs por hora.", w: ["Contando a quantidade restante nas cubas a cada 30 min.", "Retirando sempre 2 blocos fixos por hora.", "Olhando apenas a tela do monitor KVS da linha."] },
  { id: 60, level: "Básico", q: "O que é o CARD LOPE?", a: "É a ficha de tarefas da estação LOPE.", w: ["É a tabela de temperaturas das câmaras frias.", "É o cartão de ponto de partida das carnes na chapa.", "É o guia de montagem dos sacos do Delivery."] },
  { id: 61, level: "Básico", q: "Qual o tempo de vida da cebola reidratada?", a: "24 horas, incluindo 1 hora de hidratação.", w: ["12 horas, incluindo 1 hora de hidratação.", "48 horas, incluindo 2 horas de hidratação.", "24 horas na mesa e 48 horas na câmara."] },
  { id: 62, level: "Básico", q: "Qual o tempo de vida do suco, após aberto?", a: "7 dias sob refrigeração.", w: ["5 dias sob refrigeração.", "3 dias sob refrigeração.", "10 dias sob refrigeração."] },
  { id: 63, level: "Básico", q: "Qual o tempo de vida do mix, após aberto?", a: "7 dias sob refrigeração.", w: ["3 dias sob refrigeração.", "5 dias sob refrigeração.", "24 horas sob refrigeração."] },
  { id: 64, level: "Básico", q: "Qual o tempo dos queijos cheddar e ementhal após abertos?", a: "24 horas sob refrigeração.", w: ["48 horas sob refrigeração.", "12 horas sob refrigeração.", "7 dias sob refrigeração."] },
  { id: 65, level: "Básico", q: "Qual o tempo de vida da alface e da cebola nas cubas?", a: "2 horas.", w: ["4 horas.", "1 hora.", "3 horas."] },
  { id: 66, level: "Básico", q: "Quando usamos cubas médias para alface na mesa de condimentação?", a: "Nas horas pico.", w: ["Durante a abertura e o fechamento da loja.", "Apenas no turno da madrugada.", "Em horários de baixo movimento."] },
  { id: 67, level: "Básico", q: "Qual a temperatura do óleo para carnes brancas e tortas?", a: "180°C.", w: ["168°C.", "175°C.", "185°C."] },
  { id: 68, level: "Básico", q: "Qual a temperatura do óleo para McFritas?", a: "168°C.", w: ["180°C.", "172°C.", "160°C."] },
  { id: 69, level: "Básico", q: "Qual o tempo de fritura para carnes brancas?", a: "McChicken, Chicken Jr e Nuggets 3min e 15s; Crispy e Tortas 6 minutos.", w: ["McChicken, Chicken Jr e Nuggets 3min e 10s; Crispy e Tortas 5 minutos.", "McChicken, Chicken Jr e Nuggets 4 minutos; Crispy e Tortas 6 minutos.", "McChicken e Nuggets 2min e 45s; Crispy e Tortas 5min e 30s."] },
  { id: 70, level: "Básico", q: "Qual o tempo de fritura para McFritas?", a: "3 min e 10 segundos.", w: ["3 min e 15 segundos.", "2 min e 50 segundos.", "3 min e 30 segundos."] },
  { id: 71, level: "Básico", q: "Qual o Duty para McFritas?", a: "30 segundos.", w: ["20 segundos.", "45 segundos.", "15 segundos."] },
  { id: 72, level: "Básico", q: "Qual o tempo de vida das McFritas depois de prontas?", a: "7 minutos.", w: ["5 minutos.", "10 minutos.", "12 minutos."] },
  { id: 73, level: "Básico", q: "Quantas gramas de sal o saleiro das McFritas dispensa?", a: "4 gramas.", w: ["3,5 gramas.", "5 gramas.", "7 gramas."] },
  { id: 74, level: "Básico", q: "Qual EPI devemos usar para operar as estações de McFritas e Produtos Fritos?", a: "Avental e Mangote.", w: ["Apenas luva térmica azul.", "Avental antichamas e óculos.", "Luva preta e touca balaclava."] },
  { id: 75, level: "Básico", q: "Quantos panos devemos manter na estação de McFritas?", a: "2 panos.", w: ["3 panos.", "4 panos.", "1 pano."] },
  { id: 76, level: "Básico", q: "Qual é o tempo MFY (linha) com 1, 2 ou 3 pessoas?", a: "Com 1 pessoa 50 segundos, com 2 pessoas 42 segundos, com 3 pessoas 35 segundos.", w: ["Com 1 pessoa 60s, com 2 pessoas 45s, com 3 pessoas 30s.", "Com 1 pessoa 45s, com 2 pessoas 38s, com 3 pessoas 28s.", "Com 1 pessoa 55s, com 2 pessoas 40s, com 3 pessoas 32s."] },
  { id: 77, level: "Básico", q: "Qual o tempo de R2P (entrega pedido balcão)?", a: "90 segundos.", w: ["120 segundos.", "60 segundos.", "45 segundos."] },
  { id: 78, level: "Básico", q: "Qual o tempo de OEPE (drive)?", a: "120 segundos.", w: ["90 segundos.", "150 segundos.", "100 segundos."] },
  { id: 79, level: "Básico", q: "Qual o tempo de vida secundário da cebola shoyu?", a: "48 horas sob refrigeração na embalagem original e 2 horas na mesa de condimentação.", w: ["24 horas sob refrigeração e 4 horas na mesa.", "7 dias sob refrigeração e 2 horas na mesa.", "48 horas sob refrigeração e 4 horas na mesa."] },
  { id: 80, level: "Básico", q: "De quanto em quanto tempo deve ser retirado queijo para ambientar e por quanto tempo ambienta?", a: "Retiramos a cada hora e ambienta por 2 horas.", w: ["Retiramos a cada 2 horas e ambienta por 1 hora.", "Retiramos a cada 30 minutos e ambienta por 2 horas.", "Retiramos a cada 2 horas e ambienta por 4 horas."] },
  { id: 81, level: "Básico", q: "Qual a validade secundária do amendoim?", a: "10 dias na embalagem original e 5 dias no dispensador.", w: ["15 dias na embalagem original e 7 dias no dispensador.", "7 dias na embalagem original e 24 horas no dispensador.", "30 dias na embalagem original e 5 dias no dispensador."] },
  { id: 82, level: "Básico", q: "Qual a validade secundária do Ovomaltine?", a: "30 dias na embalagem original e 7 dias fracionado ou em dispensador.", w: ["15 dias na embalagem original e 24 horas no dispensador.", "10 dias na embalagem original e 5 dias no dispensador.", "30 dias na embalagem original e 24 horas no dispensador."] },
  { id: 83, level: "Básico", q: "Qual a validade secundária do Ovomaltine Rocks?", a: "15 dias na embalagem original e 24 horas fracionado ou em dispensador.", w: ["30 dias na embalagem original e 7 dias no dispensador.", "10 dias na embalagem original e 48 horas no dispensador.", "7 dias na embalagem original e 12 horas no dispensador."] },
  { id: 84, level: "Básico", q: "Qual a validade secundária das gotas de chocolate?", a: "10 dias na embalagem original e 24 horas fracionado ou em dispensador.", w: ["15 dias na embalagem original e 7 dias no dispensador.", "30 dias na embalagem original e 24 horas no dispensador.", "10 dias na embalagem original e 5 dias no dispensador."] },
  { id: 85, level: "Básico", q: "Qual a validade secundária das coberturas?", a: "7 dias.", w: ["5 dias.", "10 dias.", "14 dias."] },
  { id: 86, level: "Básico", q: "Qual a temperatura do Mix no reservatório da máquina?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De -2 a 2°C.", "De 4 a 8°C."] },
  { id: 87, level: "Básico", q: "Qual a validade secundária do biju?", a: "3 dias na embalagem original e 24 horas no dispensador.", w: ["3 dias na embalagem original e 12 horas no dispensador.", "5 dias na embalagem original e 24 horas no dispensador.", "7 dias na embalagem original e 48 horas no dispensador."] },
  { id: 88, level: "Básico", q: "Qual a validade secundária da casquinha/cascão?", a: "3 dias na embalagem original e 12 horas no dispensador.", w: ["3 dias na embalagem original e 24 horas no dispensador.", "5 dias na embalagem original e 12 horas no dispensador.", "7 dias na embalagem original e 24 horas no dispensador."] },
  { id: 89, level: "Básico", q: "Qual a validade secundária da Cebola Crispy?", a: "7 dias na embalagem original e 2 horas na mesa de condimentação.", w: ["10 dias na embalagem original e 4 horas na mesa.", "5 dias na embalagem original e 2 horas na mesa.", "48 horas na embalagem original e 2 horas na mesa."] },
  { id: 90, level: "Básico", q: "Qual a temperatura de extração do refrigerante?", a: "De 1 a 4°C.", w: ["De 1 a 7°C.", "De 0 a 3°C.", "De 2 a 6°C."] },
  { id: 91, level: "Básico", q: "Qual a temperatura de extração dos sucos?", a: "De 1 a 7°C.", w: ["De 1 a 4°C.", "De 2 a 8°C.", "De 0 a 5°C."] },
  { id: 92, level: "Básico", q: "Por que colocamos gelo nos refrigerantes?", a: "Para manter a temperatura e a carbonatação.", w: ["Apenas para completar o volume padrão do copo.", "Para diluir a concentração do xarope na água.", "Apenas para gelar o copo antes da entrega."] },
  { id: 93, level: "Básico", q: "Quais as cores dos esfregões que devemos usar na cozinha, balcão, salão, banheiros e externa?", a: "Cozinha Vermelho, Balcão e salão Azul, Banheiros e externa Verde.", w: ["Cozinha Azul, Balcão e salão Verde, Banheiros e externa Vermelho.", "Cozinha Vermelho, Balcão e salão Verde, Banheiros e externa Azul.", "Cozinha Amarelo, Balcão e salão Azul, Banheiros e externa Vermelho."] },
  { id: 94, level: "Básico", q: "Qual a quantidade de cobertura que colocamos nos McShakes de Chocolate e Morango?", a: "Chocolate 1 oz e Morango 2 oz.", w: ["Chocolate 2 oz e Morango 1 oz.", "Chocolate 1 oz e Morango 1 oz.", "Chocolate 1,5 oz e Morango 2,5 oz."] },
  { id: 95, level: "Básico", q: "Por quantos segundos devemos bater o McShake?", a: "18 segundos.", w: ["15 segundos.", "22 segundos.", "10 segundos."] },
  { id: 96, level: "Básico", q: "Qual a quantidade de itens nos sacos A, B e C respectivamente?", a: "1 a 3, 4 a 6 e 7 a 9 respectivamente.", w: ["1 a 2, 3 a 5 e 6 a 8 respectivamente.", "1 a 4, 5 a 8 e 9 a 12 respectivamente.", "2 a 4, 5 a 7 e 8 a 10 respectivamente."] },
  { id: 97, level: "Básico", q: "Quando devemos servir o pedido na OAT?", a: "Após todos os itens estarem prontos.", w: ["Assim que o sanduíche cair na OAT, antes das batatas.", "Assim que o cliente efetuar o pagamento no caixa.", "Logo após puxar os copos de refrigerante."] },
  { id: 98, level: "Básico", q: "Qual a ordem sequência correta de montagem das bandejas?", a: "Sanduíches, batatas, bebidas e sobremesas.", w: ["Bebidas, sanduíches, batatas e sobremesas.", "Bebidas, batatas, sanduíches e sobremesas.", "Sanduíches, bebidas, batatas e sobremesas."] },
  { id: 99, level: "Básico", q: "Qual o primeiro passo para fazer o McShake?", a: "Colocar 15 ml de leite no fundo do copo.", w: ["Colocar 1 oz de cobertura no fundo do copo.", "Extrair a base de baunilha até a linha do copo.", "Colocar 30 ml de mix no fundo do copo."] },
  { id: 100, level: "Básico", q: "De que forma identificamos as bebidas zero?", a: "Colocando a letra Z com caneta no copo.", w: ["Colocando dois canudos na tampa do copo.", "Dobrar todas as bolinhas da tampa plástica.", "Colocando um adesivo vermelho na lateral do copo."] },
  { id: 101, level: "Básico", q: "Qual o tamanho da casquinha?", a: "3,5 voltas ou 7,5 cm.", w: ["4,5 voltas ou 8,5 cm.", "3 voltas ou 6,5 cm.", "5 voltas ou 9 cm."] },
  { id: 102, level: "Básico", q: "Qual o 5º item que podemos sugerir para complementar a refeição do cliente?", a: "O café.", w: ["O queijo extra.", "A McFritas Grande.", "O brinquedo do McLanche Feliz."] },
  { id: 103, level: "Básico", q: "Qual o tempo de vida do café coado?", a: "1 hora.", w: ["2 horas.", "30 minutos.", "45 minutos."] },
  { id: 104, level: "Básico", q: "Quais são as 5 estações principais do Drive-Thru?", a: "Face (COD), Caixa Drive, Apoio, Entrega e Conferente.", w: ["Iniciador, Condimentador, Finalizador, Runner e Caixa.", "Face (COD), Totem, Balcão, Runner e Motoboy.", "Caixa Drive, Bebidas, Fritadeira, Chapa e Estoque."] },
  { id: 105, level: "Básico", q: "Qual o objetivo de imprecisão do delivery dos restaurantes?", a: "1%.", w: ["2%.", "0,5%.", "3%."] },
  { id: 106, level: "Básico", q: "A partir de quantas bebidas usamos suporte no drive?", a: "A partir de 2 bebidas.", w: ["A partir de 1 bebida.", "A partir de 3 bebidas.", "A partir de 4 bebidas."] },
  { id: 107, level: "Básico", q: "O que é sistema PEPS?", a: "Primeiro que entra, primeiro que sai.", w: ["Primeiro que estoca, primeiro que serve.", "Produto embalado, produto sanitizado.", "Preparo especial para sanduíches."] },
  { id: 108, level: "Intermediário", q: "Qual a temperatura da mesa de condimentação?", a: "De 49 a 57°C.", w: ["De 40 a 48°C.", "De 57 a 63°C.", "De 46 a 52°C."] },
  { id: 109, level: "Intermediário", q: "Qual o empilhamento máximo dos pães?", a: "Big Mac 26 bandejas, demais 20 bandejas.", w: ["Big Mac 20 bandejas, demais 26 bandejas.", "Big Mac 24 bandejas, demais 18 bandejas.", "Todos os pães no máximo 22 bandejas."] },
  { id: 110, level: "Intermediário", q: "Qual sabonete usamos para lavar as mãos?", a: "Sabonete Bactericida.", w: ["Detergente Neutro Concentrado.", "Sabonete Líquido Comum.", "Desengordurante Peróxido."] },
  { id: 111, level: "Intermediário", q: "Onde encontramos informações sobre alérgenos alimentares?", a: "Na lâmina de bandeja, Saber ou site do McDonald's.", w: ["Apenas no manual impresso da gerência.", "Somente nas caixas na câmara fria.", "No monitor KVS da linha e no pirômetro."] },
  { id: 112, level: "Intermediário", q: "Qual o zoom correto para o KVS da linha?", a: "4X2.", w: ["3X3.", "2X2.", "4X4."] },
  { id: 113, level: "Intermediário", q: "Quais as primeiras estações que devemos posicionar na cozinha?", a: "Chapa e LOPE.", w: ["Iniciador e Finalizador.", "McFritas e Produtos Fritos.", "Condimentação e Bebidas."] },
  { id: 114, level: "Intermediário", q: "Em qual momento o iniciador aperta servido no pedido da linha, quando trabalhamos com 2 pessoas?", a: "Após dar os dois primeiros condimentos ou assim que a pessoa da condimentação assumir.", w: ["Assim que o pão entra na tostadeira vertical.", "Somente depois que o sanduíche é embrulhado na OAT.", "Antes de colocar os pães para caramelizar."] },
  { id: 115, level: "Intermediário", q: "Qual a condimentação correta da Salada Mix?", a: "120 g de alface, 4 tomates cereja, 14 g de cebola shoyu, 4 picles, 16 g de bacon triturado e uma carne.", w: ["100 g de alface, 2 tomates, 7 g de cebola fresca, 2 picles, 2 fatias de bacon e uma carne.", "150 g de alface, 6 tomates cereja, 20 g de cebola shoyu, 2 picles, 10 g de bacon e uma carne.", "120 g de alface, 4 tomates cereja, 14 g de cebola crispy, 2 picles, 16 g de queijo e uma carne."] },
  { id: 116, level: "Intermediário", q: "Qual o tempo de vida primária do tomate?", a: "Produtos hortifruti in natura não têm tempo de validade.", w: ["10 dias, incluindo a data de fabricação.", "7 dias sob refrigeração na Walk-in.", "5 dias a partir do recebimento na loja."] },
  { id: 117, level: "Intermediário", q: "Quantos panos devemos ter na área de chapa e para que servem?", a: "4 panos: 2 para utensílios, 1 para área gordurosa, 1 para áreas não gordurosas.", w: ["3 panos: 1 para tostadeira, 1 para mesa e 1 para UHC.", "4 panos: 1 para utensílios, 2 para área gordurosa e 1 para o chão.", "2 panos: 1 para utensílios e 1 para limpar a chapa."] },
  { id: 118, level: "Intermediário", q: "Qual o tempo de remoção das carnes?", a: "18 segundos.", w: ["15 segundos.", "22 segundos.", "12 segundos."] },
  { id: 119, level: "Intermediário", q: "Qual o tempo de vida secundário do bacon cru?", a: "5 dias, incluindo o tempo de descongelamento de 12 horas.", w: ["4 dias, incluindo 24 horas de descongelamento.", "7 dias, incluindo 12 horas de descongelamento.", "3 dias, incluindo 6 horas de descongelamento."] },
  { id: 120, level: "Intermediário", q: "Qual o tempo de vida da mostarda depois de aberta?", a: "7 dias sob refrigeração.", w: ["5 dias sob refrigeração.", "24 horas sob refrigeração.", "10 dias sob refrigeração."] },
  { id: 121, level: "Intermediário", q: "Qual o tempo de vida do picles após aberto?", a: "3 dias sob refrigeração (com salmoura). Sem salmoura 24 horas.", w: ["7 dias com salmoura e 48 horas sem salmoura.", "5 dias com salmoura e 12 horas sem salmoura.", "48 horas com salmoura e 4 horas sem salmoura."] },
  { id: 122, level: "Intermediário", q: "Qual o tempo de vida primário da cebola e alface?", a: "10 dias, incluindo a data de fabricação.", w: ["7 dias, incluindo a data de fabricação.", "15 dias a partir da entrega.", "5 dias sob refrigeração na Walk-in."] },
  { id: 123, level: "Intermediário", q: "Qual o percentual máximo de compostos polares aceitável para a gordura?", a: "24%.", w: ["20%.", "18%.", "30%."] },
  { id: 124, level: "Intermediário", q: "Quais os sinais de decomposição do óleo?", a: "Espuma Amarelada, Cheiro Forte e ácido, Cor escura e Fumaça excessiva.", w: ["Óleo muito claro, ausência de bolhas e sem cheiro.", "Espuma branca leve, cor dourada brilhante e aroma suave.", "Cristalização nas bordas da cuba e fervura abaixo de 100°C."] },
  { id: 125, level: "Intermediário", q: "Quais são os 6 inimigos do óleo?", a: "Sal, Ar, Água, Altas temperaturas, Resíduos de carbono e Detergente.", w: ["Sal, Açúcar, Gelo, Baixas temperaturas, Luz solar e Papel.", "Ar, Água, Cloro, Óleo novo, Batata congelada e Inox.", "Sal, Pimenta, Cebola, Vapor, Fritura rápida e Filtragem."] },
  { id: 126, level: "Intermediário", q: "Qual o tempo de vida do queijo na mesa de preparação?", a: "4 horas, incluindo 2 horas de ambientação.", w: ["6 horas, incluindo 2 horas de ambientação.", "2 horas no total, sendo 1 hora de ambientação.", "8 horas, incluindo 4 horas de ambientação."] },
  { id: 127, level: "Intermediário", q: "Qual a quantidade de água que devemos usar para hidratar 1 pacote de cebola?", a: "3 litros, de 1 a 4°C.", w: ["4 litros, de 1 a 7°C.", "2 litros, de 5 a 10°C.", "3,5 litros, em temperatura ambiente."] },
  { id: 128, level: "Intermediário", q: "Quantas fatias de queijo podemos colocar em cada espaço da cuba de ambientação para queijos?", a: "1 bloco, 40 fatias, dividido em 2 partes.", w: ["2 blocos, 80 fatias, divididos em 4 partes.", "Meio bloco, 20 fatias, sem dividir.", "1 bloco, 60 fatias, dividido em 3 partes."] },
  { id: 129, level: "Intermediário", q: "A que altura devemos segurar o saleiro das McFritas?", a: "20 cm.", w: ["10 cm.", "30 cm.", "5 cm."] },
  { id: 130, level: "Intermediário", q: "De que forma devemos segurar as pistolas de molho ao condimentar os sanduíches?", a: "Com as duas mãos a 2 cm de altura.", w: ["Com apenas uma mão a 10 cm de altura.", "Com as duas mãos a 15 cm de altura.", "Encostando o bico diretamente no pão."] },
  { id: 131, level: "Intermediário", q: "Qual o peso das McFritas P, M e G?", a: "73 g, 102 g e 146 g, respectivamente.", w: ["43 g, 102 g e 146 g, respectivamente.", "70 g, 100 g e 150 g, respectivamente.", "75 g, 110 g e 140 g, respectivamente."] },
  { id: 132, level: "Intermediário", q: "Quantas vezes devemos misturar as McFritas após salgá-las?", a: "De 2 a 3 vezes para misturar o sal por igual.", w: ["Apenas 1 vez para não quebrar.", "De 5 a 6 vezes vigorosamente.", "Não devemos misturar após salgar."] },
  { id: 133, level: "Intermediário", q: "Qual a temperatura e tempo de aquecimento das chapas?", a: "Platen Superior 218°C / Inferior 177°C - Aquecimento 45 minutos.", w: ["Platen Superior 177°C / Inferior 218°C - Aquecimento 30 minutos.", "Platen Superior 254°C / Inferior 271°C - Aquecimento 45 minutos.", "Platen Superior 200°C / Inferior 168°C - Aquecimento 20 minutos."] },
  { id: 134, level: "Intermediário", q: "Qual a temperatura e tempo de congelamento dos congeladores portáteis?", a: "De -18 a -23°C e 45 minutos de congelamento.", w: ["De -10 a -15°C e 30 minutos de congelamento.", "De 1 a 4°C e 45 minutos de resfriamento.", "De -18 a -23°C e 15 minutos de congelamento."] },
  { id: 135, level: "Intermediário", q: "Onde devem ser descartados os rejeitos?", a: "Lixeira identificada com etiqueta e saco preto.", w: ["Qualquer lixeira do salão com saco transparente.", "Lixeira comum da linha com saco azul.", "Direto nas caixas de papelão da câmara."] },
  { id: 136, level: "Intermediário", q: "Quais os princípios da Cooltura de Serviço?", a: "Agilidade, Generosidade, Humildade, Vocação de Serviço e Inclusão.", w: ["Limpeza, Organização, Preparação, Estocagem e Rapidez.", "Qualidade, Serviço, Limpeza, Valor e Sustentabilidade.", "Simpatia, Velocidade, Precisão, Economia e Liderança."] },
  { id: 137, level: "Intermediário", q: "Qual o propósito da Marca?", a: "Fazer de cada dia uma oportunidade de alimentar pessoas e construir sonhos.", w: ["Servir comida rápida e barata em todos os bairros.", "Ser a maior rede de hambúrgueres do mundo.", "Vender mais combos grandes e adicionais todos os dias."] },
  { id: 138, level: "Intermediário", q: "Qual a declaração de identidade da Marca?", a: "Fazemos as coisas simples, juntos e com paixão.", w: ["Pequenas mudanças, grande impacto no sabor.", "Primeiro que entra, primeiro que sai sempre.", "Olha, serve e ativa com velocidade máxima."] },
  { id: 139, level: "Intermediário", q: "Com quanto tempo de antecedência deve ser feito o plano de chão?", a: "48 horas.", w: ["24 horas.", "12 horas.", "72 horas."] },
  { id: 140, level: "Intermediário", q: "Qual é a promessa do fazer?", a: "Fazer bem, fazer rápido e fazer especial.", w: ["Fazer limpo, fazer quente e fazer barato.", "Olhar, servir e ativar no tempo certo.", "Limpar, lavar, enxaguar e sanitizar."] },
  { id: 141, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do Quarteirão?", a: "1/40 oz de mostarda, 1/2 oz de ketchup, 7 g de cebola fresca, 2 picles, 2 fatias de queijo em estrela, 1 carne 4:1.", w: ["1/40 oz de mostarda, 1/3 oz de ketchup, 3,5 g de cebola hidratada, 1 picles, 1 queijo, 1 carne 4:1.", "1/2 oz de mostarda, 1/2 oz de ketchup, 10 g de cebola fresca, 3 picles, 2 queijos, 1 carne 10:1.", "1/40 oz de mostarda, 1/2 oz de ketchup, 28 g de alface, 2 tomates, 2 queijos, 1 carne 4:1."] },
  { id: 142, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do Cheeseburger?", a: "1/40 oz de mostarda, 1/3 oz de ketchup, 1 picles, 1 fatia de queijo, 1 carne de 10:1 com 3,5 g de cebola.", w: ["1/40 oz de mostarda, 1/3 oz de ketchup, 2 picles, 2 queijos, 1 carne 10:1 com 7 g de cebola.", "1/3 oz de mostarda, 1/3 oz de ketchup, 2 picles, 1 queijo, 1 carne 4:1 com 3,5 g de cebola.", "1/40 oz de mostarda, 1/3 oz de ketchup, 12 g de alface, 1 picles, 1 queijo e 1 carne 10:1."] },
  { id: 143, level: "Intermediário", q: "Qual a condimentação e quantidades de ingredientes do McNífico Bacon?", a: "1/40 oz mostarda, 1/2 oz ketchup, 7 g cebola fresca, 2/3 oz maionese, 28 g alface, 2 tomates, 2 bacons, 1 queijo, 1 carne 4:1.", w: ["1/40 oz mostarda, 1/3 oz ketchup, 3,5 g cebola, 1/2 oz maionese, 12 g alface, 1 tomate, 3 bacons, 2 queijos, 1 carne 4:1.", "1 oz molho tasty, 1/2 oz ketchup, 10 g cebola, 28 g alface, 2 tomates, 2 bacons, 3 queijos ementhal, 1 carne 4:1.", "1/40 oz mostarda, 1/2 oz ketchup, 7 g cebola, 2/3 oz maionese, 24 g alface, 1 tomate, 1 bacon, 2 queijos, 1 carne 10:1."] },
  { id: 144, level: "Intermediário", q: "Qual o distanciamento e espaçamento que devemos manter entre as caixas nas câmaras?", a: "5 cm do chão e das paredes e 2,5 cm entre as caixas.", w: ["10 cm do chão e das paredes e 5 cm entre as caixas.", "3 cm do chão e das paredes e 1 cm entre as caixas.", "8 cm do chão e das paredes e 4 cm entre as caixas."] },
  { id: 145, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de batata?", a: "6 caixas.", w: ["4 caixas.", "5 caixas.", "8 caixas."] },
  { id: 146, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de alface?", a: "6 caixas.", w: ["4 caixas.", "5 caixas.", "8 caixas."] },
  { id: 147, level: "Intermediário", q: "Qual o empilhamento máximo para as caixas de mix?", a: "4 caixas.", w: ["6 caixas.", "5 caixas.", "3 caixas."] },
  { id: 148, level: "Intermediário", q: "Qual o empilhamento máximo para caixas de suco?", a: "4 caixas.", w: ["6 caixas.", "5 caixas.", "8 caixas."] },
  { id: 149, level: "Intermediário", q: "Qual o empilhamento máximo para caixas de queijo?", a: "5 caixas.", w: ["4 caixas.", "6 caixas.", "8 caixas."] },
  { id: 150, level: "Intermediário", q: "O que significa a sigla LOPE?", a: "Limpeza, Organização, Preparação e Estocagem.", w: ["Lavagem, Operação, Produção e Entrega.", "Linha Operacional de Produtos e Embalagens.", "Limpeza, Operação, Padronização e Estoque."] },
  { id: 151, level: "Intermediário", q: "Qual é o método de 4 etapas que usamos para lavar utensílios e equipamentos?", a: "Limpar, Lavar, Enxaguar e Sanitizar.", w: ["Molhar, Ensaboar, Escovar e Secar.", "Raspar, Lavar, Secar com pano e Guardar.", "Limpar, Desengordurar, Enxaguar e Polir."] },
  { id: 152, level: "Intermediário", q: "Qual a velocidade de extração dos sorvetes?", a: "De 5 a 7,5 oz em 10 segundos.", w: ["De 3 a 5 oz em 10 segundos.", "De 8 a 10 oz em 10 segundos.", "De 5 a 7,5 oz em 15 segundos."] },
  { id: 153, level: "Intermediário", q: "Qual deve ser a proporção correta de suco concentrado e água?", a: "3 partes de suco para 15 de água.", w: ["1 parte de suco para 5,2 de água.", "2 partes de suco para 10 de água.", "3 partes de suco para 12 de água."] },
  { id: 154, level: "Intermediário", q: "Qual a ordem correta de experimentação dos refrigerantes?", a: "Coca, Fanta, Coca Zero, Sprite Zero, Fanta Guaraná.", w: ["Coca Zero, Sprite Zero, Coca, Fanta, Fanta Guaraná.", "Sprite Zero, Fanta Guaraná, Fanta, Coca, Coca Zero.", "Coca, Coca Zero, Fanta, Fanta Guaraná, Sprite Zero."] },
  { id: 155, level: "Intermediário", q: "Qual a ordem de experimentação dos sucos?", a: "Laranja e uva.", w: ["Uva e laranja.", "Maracujá, laranja e uva.", "Uva, maçã e laranja."] },
  { id: 156, level: "Intermediário", q: "Qual a temperatura do banho-maria e das coberturas?", a: "De 57° a 63°C e de 46° a 52°C, respectivamente.", w: ["De 46° a 52°C e de 57° a 63°C, respectivamente.", "De 49° a 57°C e de 40° a 45°C, respectivamente.", "De 65° a 72°C e de 50° a 58°C, respectivamente."] },
  { id: 157, level: "Intermediário", q: "Quantas pedras de gelo colocamos nos refrigerantes P, M e G?", a: "0,5 pá (5 pedras), 2/3 pá (7 pedras) e 1 pá (10 pedras), respectivamente.", w: ["1/3 pá (3 pedras), 0,5 pá (5 pedras) e 2/3 pá (7 pedras).", "0,5 pá (6 pedras), 1 pá (10 pedras) e 1,5 pá (15 pedras).", "4 pedras no P, 8 pedras no M e 12 pedras no G."] },
  { id: 158, level: "Intermediário", q: "Quais as quantidades corretas de 1 Sundae?", a: "4 voltas e meia de massa (4,5 oz), 2 tiros de cobertura (1 oz) e 7 gramas de amendoim.", w: ["6 voltas de massa (6 oz), 2 tiros de cobertura (1 oz) e 14 g de amendoim.", "3 voltas e meia de massa (3,5 oz), 1 tiro de cobertura e 7 g de amendoim.", "4 voltas e meia de massa (4,5 oz), 1 tiro de cobertura e 10 g de amendoim."] },
  { id: 159, level: "Intermediário", q: "Quais as quantidades corretas de 1 Top Sundae?", a: "6 voltas de massa (6 oz), 2 tiros de cobertura (1 no fundo e 1 em cima = 1 oz), 1 tiro de paçoca (1 oz) e 2 bijus.", w: ["4,5 voltas de massa (4,5 oz), 2 tiros de cobertura, 7 g de amendoim e 1 biju.", "6 voltas de massa (6 oz), 3 tiros de cobertura, 2 tiros de paçoca e 1 biju.", "5 voltas de massa (5 oz), 2 tiros de cobertura, 20 g de paçoca e 2 bijus."] },
  { id: 160, level: "Intermediário", q: "Qual a temperatura ambiente do salão?", a: "De 23 a 27°C.", w: ["De 18 a 22°C.", "De 20 a 24°C.", "De 25 a 30°C."] },
  { id: 161, level: "Intermediário", q: "Quais os materiais necessários que devemos ter no salão para limpeza das mesas e bancos?", a: "1 pano seco e 1 úmido para mesas, 1 pano seco e 1 úmido para bancos e 1 borrifador com sanitizante.", w: ["1 pano úmido único para mesas e bancos e 1 borrifador com detergente.", "2 panos secos para mesas, 1 pano para o chão e álcool 70%.", "3 panos úmidos e 1 balde com água e sabão."] },
  { id: 162, level: "Intermediário", q: "Quais são os 4 grupos de produtos que compõem o pedido do cliente?", a: "Sanduíches, acompanhamentos, bebidas e sobremesas.", w: ["Hambúrgueres, frango, saladas e café.", "Pães, carnes, molhos e embalagens.", "Combos, avulsos, adicionais e brinquedos."] },
  { id: 163, level: "Avançado", q: "Qual a temperatura da tostadeira?", a: "Placa A e B 271°C e Placa C 254°C.", w: ["Placa A e B 254°C e Placa C 271°C.", "Placa A, B e C todas a 260°C.", "Placa A e B 218°C e Placa C 177°C."] },
  { id: 164, level: "Avançado", q: "O que é contaminação cruzada?", a: "É a transferência de microrganismos de um lugar para outro.", w: ["É a multiplicação de bactérias na zona de perigo térmico.", "É a queima excessiva do óleo de fritura acima de 24%.", "É a reação alérgica causada por glúten ou derivados do leite."] },
  { id: 165, level: "Avançado", q: "O que são Alérgenos?", a: "São substâncias que podem causar reações alérgicas no organismo como resposta do sistema imunológico.", w: ["São bactérias que se multiplicam entre 4,4°C e 60°C.", "São resíduos químicos de detergente ou sanitizante.", "São compostos polares formados pela degradação da gordura."] },
  { id: 166, level: "Avançado", q: "Qual a calibragem do dispensador de ketchup?", a: "Ketchup Regular 6 tiros = 2 oz/60 ml, Quarteirão 6 tiros = 3 oz/90 ml.", w: ["Ketchup Regular 4 tiros = 2 oz/60 ml, Quarteirão 4 tiros = 3 oz/90 ml.", "Ketchup Regular 6 tiros = 3 oz/90 ml, Quarteirão 6 tiros = 2 oz/60 ml.", "Ketchup Regular 10 tiros = 1 oz/30 ml, Quarteirão 6 tiros = 2 oz/60 ml."] },
  { id: 167, level: "Avançado", q: "Qual a calibragem do dispensador de mostarda?", a: "47 tiros = 1 oz/30 ml.", w: ["40 tiros = 1 oz/30 ml.", "30 tiros = 1 oz/30 ml.", "47 tiros = 2 oz/60 ml."] },
  { id: 168, level: "Avançado", q: "Qual a calibragem da pistola de molho Big Mac?", a: "4 tiros de 1/2 oz = 2 oz/60 ml.", w: ["6 tiros de 1/2 oz = 3 oz/90 ml.", "4 tiros de 1 oz = 4 oz/120 ml.", "2 tiros de 1/2 oz = 1 oz/30 ml."] },
  { id: 169, level: "Avançado", q: "Qual a velocidade do motor da tostadeira?", a: "A partir de 3300.", w: ["A partir de 2500.", "A partir de 1800.", "A partir de 4200."] },
  { id: 170, level: "Avançado", q: "Qual o procedimento correto de sanitização dos tomates?", a: "1. Retirar pela tabela chart; 2. Lavar em água corrente; 3. Cobrir com sanitizante por 15 min; 4. Enxaguar em água corrente.", w: ["1. Retirar 1 caixa; 2. Cobrir com sanitizante por 10 min; 3. Fatiar sem enxaguar; 4. Guardar.", "1. Lavar com sabonete bactericida; 2. Deixar no cloro por 30 min; 3. Secar com pano; 4. Cortar.", "1. Retirar pelo chart; 2. Deixar no sanitizante por 5 min; 3. Ambientar por 4h; 4. Lavar após fatiar."] },
  { id: 171, level: "Avançado", q: "Qual procedimento devemos seguir ao trabalhar com a tela LOOK & COOK?", a: "OSA: Olha, Serve e Ativa.", w: ["PEPS: Primeiro que Entra, Primeiro que Sai.", "DFS: Medir, Calibrar e Registrar.", "KVS: Iniciar, Condimentar e Embrulhar."] },
  { id: 172, level: "Avançado", q: "Qual o ponto de partida para as carnes vermelhas?", a: "10:1 a partir de 39\" (Next Gen 41\") | 4:1 a partir de 104\" (Next Gen 126\").", w: ["10:1 a partir de 45\" (Next Gen 50\") | 4:1 a partir de 90\" (Next Gen 110\").", "10:1 a partir de 30\" (Next Gen 35\") | 4:1 a partir de 120\" (Next Gen 140\").", "10:1 a partir de 42\" (Next Gen 39\") | 4:1 a partir de 126\" (Next Gen 104\")."] },
  { id: 173, level: "Avançado", q: "Qual o Gap correto para as carnes de 10:1?", a: "225\" por 20 segundos, final 290\".", w: ["290\" por 20 segundos, final 225\".", "250\" por 15 segundos, final 310\".", "450\" por 20 segundos, final 290\"."] },
  { id: 174, level: "Avançado", q: "Qual a temperatura da estufa de tortas?", a: "De 66 a 82°C.", w: ["De 49 a 57°C.", "De 79 a 85°C.", "De 57 a 63°C."] },
  { id: 175, level: "Avançado", q: "Qual a capacidade máxima de tortas na estufa?", a: "32 tortas.", w: ["16 tortas.", "24 tortas.", "40 tortas."] },
  { id: 176, level: "Avançado", q: "O que significa Manutenção e Recuperação na área de produtos fritos?", a: "Manutenção: ativar para manter o nível PLS. Recuperação: ativar para repor o nível PLS com gavetas zeradas.", w: ["Manutenção: limpar e filtrar a fritadeira. Recuperação: trocar o óleo aos 24%.", "Manutenção: fritar metade do cesto. Recuperação: fritar o dobro da rodada máxima.", "Manutenção: manter carnes na UHC por 60 min. Recuperação: voltar carnes frias ao óleo."] },
  { id: 177, level: "Avançado", q: "Qual a concentração correta de cloro no sanitizante presente nos panos e borrifadores?", a: "De 50 a 100 ppm.", w: ["De 100 a 200 ppm.", "De 25 a 50 ppm.", "De 150 a 250 ppm."] },
  { id: 178, level: "Avançado", q: "Qual o rendimento da mostarda pouch?", a: "1235 sanduíches por kg.", w: ["950 sanduíches por kg.", "1500 sanduíches por kg.", "840 sanduíches por kg."] },
  { id: 179, level: "Avançado", q: "Qual o rendimento da Alface?", a: "45,4 sanduíches por kg.", w: ["35,2 sanduíches por kg.", "60,5 sanduíches por kg.", "28,4 sanduíches por kg."] },
  { id: 180, level: "Avançado", q: "Qual o tempo de vida primário dos sucos?", a: "Uva 180 dias e Laranja 150 dias.", w: ["Uva 150 dias e Laranja 180 dias.", "Uva 90 dias e Laranja 90 dias.", "Uva 120 dias e Laranja 100 dias."] },
  { id: 181, level: "Avançado", q: "Quais são as três dimensões que concretizam a Missão do Embaixador na Experiência do Cliente?", a: "Viagem do klient, Experiência Familiar e Construção de Vendas.", w: ["Fazer bem, Fazer rápido e Fazer especial.", "Qualidade, Serviço e Limpeza.", "Sugestão de Vendas, Venda Sugestiva e Adicionais."] },
  { id: 182, level: "Avançado", q: "Em que ano e onde foi fundado o McDonald's?", a: "Em 1955, na cidade de Des Plaines, Illinois, Estados Unidos.", w: ["Em 1948, na cidade de Chicago, Califórnia, EUA.", "Em 1961, na cidade de Nova York, EUA.", "Em 1952, na cidade de Los Angeles, EUA."] },
  { id: 183, level: "Avançado", q: "Onde e em que ano inaugurou o primeiro McDonald's no Brasil?", a: "Em 1979, na rua Hilário de Gouveia, em Copacabana, no Rio de Janeiro.", w: ["Em 1981, na Avenida Paulista, em São Paulo.", "Em 1975, em Ipanema, no Rio de Janeiro.", "Em 1983, no Centro de São Paulo."] },
  { id: 184, level: "Avançado", q: "Quando inaugurou o primeiro McDonald's em São Paulo?", a: "Em 1981, na Av. Paulista.", w: ["Em 1979, na Av. Brigadeiro Faria Lima.", "Em 1985, na Rua Augusta.", "Em 1978, no Shopping Ibirapuera."] },
  { id: 185, level: "Avançado", q: "Qual a condimentação e quantidades de ingredientes do Big Mac?", a: "1 tiro de 1/2 oz de molho Big na base e no club, 12 g de alface na base e 12 g no club (24 g), 2 picles no club, 1 queijo na base e 2 carnes 10:1 com 3,5 g de cebola.", w: ["1 tiro de 1 oz de molho Big na base e no club, 14 g de alface na base e no club (28 g), 2 picles, 2 queijos e 2 carnes 10:1.", "1 tiro de 1/2 oz de molho Big na base e coroa, 24 g de alface na base, 1 picles, 1 queijo e 2 carnes 10:1.", "2 tiros de 1/2 oz de molho Big na base, 12 g de alface no club, 4 picles, 2 queijos e 2 carnes 10:1."] },
  { id: 186, level: "Avançado", q: "Qual a condimentação e quantidades de ingredientes do Big Tasty?", a: "2 tiros de 1 oz molho Tasty (base e coroa), 10 g cebola, 28 g alface, 2 tomates, 3 queijos ementhal, carne 4:1 (1, 2 ou 3) destacando a TAG.", w: ["1 tiro de 1/2 oz molho Tasty (base e coroa), 7 g cebola, 24 g alface, 2 tomates, 2 queijos cheddar, carne 4:1.", "2 tiros de 2/3 oz molho Tasty, 14 g cebola, 28 g alface, 3 tomates, 3 queijos cheddar e carne 10:1.", "1 tiro de 1 oz molho Tasty apenas na coroa, 7 g cebola, 28 g alface, 1 tomate, 2 queijos ementhal e 1 carne 4:1."] },
  { id: 187, level: "Avançado", q: "Quais são os 7 conceitos da UHC?", a: "UHC é o coração da cozinha; Ativar pouco, porém sempre; Usar sistema de garagem; Conhecer tempos das carnes; Acelerar/desacelerar na mesma chamada; Seguir níveis PLS; Não compensar um erro com outro.", w: ["UHC a 90°C; Ativar lotes máximos sempre; Empilhar 4 carnes 4:1; Desligar timers no rush; Ignorar PLS; Misturar gavetas; Usar 1 gaveta.", "Plano de chão; Rota Gerencial; Pré-Plantão; Pós-Plantão; Posicionamento; Checklist; Experimentação.", "Limpar; Lavar; Enxaguar; Sanitizar; Secar ao ar; Etiquetar com 24h; Guardar na câmara."] },
  { id: 188, level: "Avançado", q: "O que é e para que serve a caramelização dos pães?", a: "É a queima de 5% do açúcar do pão e serve para criar uma película que impede que os condimentos penetrem no pão.", w: ["É a queima de 15% do amido do pão para deixá-lo crocante por fora e seco por dentro.", "É o aquecimento a 180°C por 10 segundos apenas para derreter o gergelim da coroa.", "É a perda de 20% da umidade do pão na mesa para absorver melhor os molhos."] },
  { id: 189, level: "Avançado", q: "Quais são as temperaturas da Zona de Risco para crescimento de microrganismos?", a: "De 4,4°C a 60°C.", w: ["De 1°C a 49°C.", "De 10°C a 70°C.", "De 0°C a 45°C."] },
  { id: 190, level: "Avançado", q: "Qual a temperatura de extração do sorvete?", a: "-8 a -9°C.", w: ["-4 a -6°C.", "-12 a -15°C.", "-1 a -4°C."] },
  { id: 191, level: "Avançado", q: "Qual a proporção correta de água e xarope para refrigerantes normais?", a: "1 parte de xarope para 5,2 partes de água.", w: ["3 partes de xarope para 15 partes de água.", "1 parte de xarope para 4,0 partes de água.", "2 partes de xarope para 6,5 partes de água."] },
  { id: 192, level: "Avançado", q: "Quais são os 7 básicos operacionais?", a: "Plano de chão, Rota Gerencial, Pré-Plantão, Pós-Plantão, Posicionamento, Checklist e Experimentação.", w: ["Agilidade, Generosidade, Humildade, Vocação de Serviço, Inclusão, Simpatia e Vendas.", "Chapa, Linha, Fritura, Bebidas, Sobremesas, Balcão e Drive-Thru.", "Limpeza, Organização, Preparação, Estocagem, Recebimento, Contagem e Fechamento."] },
  { id: 193, level: "Avançado", q: "O que é overrun do mix e qual o seu percentual?", a: "Mede a proporção entre mix e ar; seu percentual é de 55 a 65% com ideal 58%.", w: ["Mede o tempo de congelamento do cilindro; percentual de 40 a 50% com ideal 45%.", "Mede a gordura do leite no mix; percentual de 20 a 30% com ideal 24%.", "Mede a velocidade de extração em 10s; percentual de 70 a 80% com ideal 75%."] },
  { id: 194, level: "Avançado", q: "Quais as quantidades corretas de complementos dos sorvetes?", a: "Gotas 50 g, Rocks 20 g, Ovomaltine 20 g, Paçoca 20 g, Ovo Shake 54 g.", w: ["Gotas 30 g, Rocks 30 g, Ovomaltine 30 g, Paçoca 15 g, Ovo Shake 40 g.", "Gotas 20 g, Rocks 50 g, Ovomaltine 54 g, Paçoca 20 g, Ovo Shake 20 g.", "Gotas 40 g, Rocks 15 g, Ovomaltine 25 g, Paçoca 25 g, Ovo Shake 60 g."] },
  { id: 195, level: "Avançado", q: "Qual a temperatura do café coado?", a: "A partir de 77°C.", w: ["A partir de 65°C.", "De 57°C a 63°C.", "A partir de 85°C."] },
  { id: 196, level: "Avançado", q: "Qual a proporção correta de água e café para o café coado?", a: "1.100 ml de água para 1 pacote de 50 g de café.", w: ["1.000 ml de água para 1 pacote de 100 g de café.", "1.500 ml de água para 1 pacote de 50 g de café.", "800 ml de água para 1 pacote de 40 g de café."] },
  { id: 197, level: "Avançado", q: "O que é Best Burger?", a: "É o novo padrão para os hambúrgueres McDonald's. Pequenas mudanças, grande impacto.", w: ["É o sistema de fritura rápida para carnes brancas em 3 minutos.", "É o programa de auditoria semestral de limpeza das chapas.", "É a campanha promocional exclusiva para venda no Drive-Thru."] },
  { id: 198, level: "Avançado", q: "Quais são as técnicas dos influencers vendedores?", a: "Somos Especialistas, Gostamos de Surpreender, Criamos Oportunidades, Vivenciamos as mesmas coisas, Criamos tendência, Somos Afetuosos.", w: ["Sugestão de Vendas, Venda Sugestiva, Adicionais, Combo Grande, Sobremesa e Café.", "Fazer bem, Fazer rápido, Fazer especial, Sorrir, Agradecer e Despedir.", "Olhar nos olhos, Oferecer bacon, Oferecer batata grande, Cobrar rápido e Entregar."] },
  { id: 199, level: "Avançado", q: "Qual o rendimento da batata?", a: "9,11 batatas pequenas por kg.", w: ["7,50 batatas pequenas por kg.", "12,40 batatas pequenas por kg.", "6,80 batatas pequenas por kg."] },
  { id: 200, level: "Avançado", q: "Qual a descrição do padrão ouro de qualidade do suco?", a: "Frio, cor brilhante e sabor doce.", w: ["Com espuma, cor escura e sabor cítrico ácido.", "Em temperatura ambiente, translúcido e sem açúcar.", "Congelado com cristais de gelo e altamente concentrado."] }
];

const STORAGE_USERS_KEY = "mequi_olimpiadas_users_v6";
const STORAGE_CURRENT_KEY = "mequi_olimpiadas_active_user_v6";
const STORAGE_THEME_KEY = "mequi_olimpiadas_theme_v7";
const STORAGE_DUEL_HISTORY = "mequi_olimpiadas_duel_history_v75";
const ADMIN_SECRET_PASS = "342005";
const HEARTS_COOLDOWN_MS = 10 * 60 * 1000;
const SYNC_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v65_cluster_state";
const DUEL_MQTT_TOPIC = "mequi/venture/olimpiadas2026/v71_live_duels";
const CLOUD_HTTP_URL = "https://ntfy.sh/mequi_venture_olimpiadas_2026_v63_store";

let mqttClients = [], users = {}, currentUserKey = localStorage.getItem(STORAGE_CURRENT_KEY) || null;
let currentBookFilter = "ALL", currentStreak = 0, currentHearts = 5, currentQuizQuestionId = null, isAdminUnlocked = false;
let searchDebounceTimer = null, cloudSyncQueueTimer = null, cooldownIntervalId = null, heartbeatIntervalId = null;
let lastLeaderboardHash = "", lastAdminListHash = "", lastHttpFetchTime = 0;
let pendingDuelInvite = null, activeDuel = null, currentReviewItem = null, photoUploadTarget = "register";
let duelHistoryList = JSON.parse(localStorage.getItem(STORAGE_DUEL_HISTORY) || "[]");
let activeRecipe = KITCHEN_RECIPES[0], currentRecipeStep = 0;

// =========================================================================
// 🎵 MOTOR DE ÁUDIO COMPACTO (JINGLE + CLIQUES + ERRO + GIRO 3D)
// =========================================================================
let globalAudioCtx = null;
function getAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!globalAudioCtx) globalAudioCtx = new Ctx();
  if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
  return globalAudioCtx;
}
document.addEventListener("click", getAudio, { once: true });
document.addEventListener("touchstart", getAudio, { once: true });

function playTone(notes, type = "triangle", vol = 0.4) {
  try {
    const ctx = getAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(n.f, now + (n.s || 0));
      if (n.fEnd) osc.frequency.exponentialRampToValueAtTime(n.fEnd, now + (n.s || 0) + n.d);
      gain.gain.setValueAtTime(vol, now + (n.s || 0));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (n.s || 0) + n.d);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now + (n.s || 0)); osc.stop(now + (n.s || 0) + n.d + 0.02);
    });
  } catch (e) {}
}

function playMcDonaldsJingle() {
  const seq = [{ f: 523.25, s: 0, d: 0.16 }, { f: 587.33, s: 0.19, d: 0.16 }, { f: 659.25, s: 0.38, d: 0.2 }, { f: 880, s: 0.65, d: 0.26 }, { f: 783.99, s: 0.96, d: 0.65 }];
  playTone(seq, "triangle", 0.7);
  playTone(seq.map(x => ({ ...x, f: x.f * 2 })), "sine", 0.22);
}
function playHitSuccessSound() { playTone([{ f: 587.33, s: 0, d: 0.09 }, { f: 880, s: 0.08, d: 0.22 }], "sine", 0.45); }
function playWrongAnswerSound() { playTone([{ f: 220, s: 0, d: 0.14 }, { f: 155, s: 0.16, d: 0.24 }], "sawtooth", 0.32); }
function playTabClickSound() { playTone([{ f: 520, fEnd: 880, s: 0, d: 0.06 }], "triangle", 0.28); }
function playCardFlipSound() { playTone([{ f: 260, fEnd: 620, s: 0, d: 0.12 }], "sine", 0.32); }

// =========================================================================
// ⏳ CRONÔMETRO DE FINALIZAÇÃO (25/10) + 🍔 SISTEMA DE COZINHA (AUTO-INJETADOS)
// =========================================================================
function injectCountdownAndKitchenUI() {
  const themeBtn = $("themeToggleBtn");
  if (themeBtn && !$("soundTestBtn")) {
    const sb = document.createElement("button");
    sb.id = "soundTestBtn"; sb.title = "Tocar Jingle"; sb.innerHTML = "🔊";
    sb.className = "bg-slate-950/30 hover:bg-slate-950/45 w-9 h-9 rounded-2xl flex items-center justify-center text-sm border border-white/15 btn-tap";
    sb.onclick = playMcDonaldsJingle;
    themeBtn.parentNode.insertBefore(sb, themeBtn);
  }

  const mainEl = document.querySelector("main");
  if (mainEl && !$("countdownBannerTop")) {
    const banner = document.createElement("div");
    banner.id = "countdownBannerTop";
    banner.className = "pro-card rounded-3xl p-3.5 mb-4 border-2 border-[#FFC72C] flex items-center justify-between gap-2 shadow-md";
    banner.innerHTML = `
      <div class="flex items-center gap-2.5">
        <span class="text-2xl float-slow">🏁</span>
        <div>
          <span class="text-[10px] font-black uppercase text-red-500 tracking-wider block">Finalização Oficial • 25/10</span>
          <p class="font-black text-xs">Reta Final da Caneca Oficial Méqui ☕</p>
        </div>
      </div>
      <div id="countdownTimerText" class="gold-gradient text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-sm shrink-0">--d --h --m</div>
    `;
    mainEl.insertBefore(banner, mainEl.firstChild);
  }

  const printArea = $("rankingPrintArea");
  if (printArea && !$("rankingPrintCountdown")) {
    const pb = document.createElement("div");
    pb.id = "rankingPrintCountdown";
    pb.className = "subtle-box rounded-2xl p-2.5 text-center text-xs font-black border border-amber-500/40";
    pb.innerHTML = `⏳ Encerramento Oficial: <span class="text-red-500">25/10</span> • <span id="printCountdownSpan">--</span>`;
    printArea.insertBefore(pb, printArea.children[1]);
  }

  const tabQuiz = $("tab-quiz");
  if (tabQuiz && !$("kitchenSystemCard")) {
    const kitchenCard = document.createElement("div");
    kitchenCard.id = "kitchenSystemCard";
    kitchenCard.className = "pro-card rounded-3xl p-5 border-2 border-red-500/40 space-y-3";
    kitchenCard.innerHTML = `
      <div class="flex items-center justify-between gap-2 border-b border-slate-500/20 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-11 h-11 rounded-2xl mc-gradient text-[#FFC72C] flex items-center justify-center text-2xl font-black shrink-0 shadow">🍔</div>
          <div>
            <span class="text-[10px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Sistema de Cozinha • +5 XP</span>
            <h3 class="font-black text-sm mt-0.5">Bancada Monta-Lanche (Linha 49°C a 57°C)</h3>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <select id="kitchenRecipeSelect" onchange="selectKitchenRecipe(this.value)" class="flex-1 px-3 py-2 rounded-xl subtle-box text-xs font-extrabold focus:outline-none">
          ${KITCHEN_RECIPES.map(r => `<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
        <button onclick="resetKitchenGame()" class="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-xs btn-tap">Reiniciar 🔄</button>
      </div>
      <div class="subtle-box p-3 rounded-2xl space-y-1.5">
        <div class="flex justify-between text-[11px] font-black">
          <span class="text-amber-500">📋 Montagem Atual (Ordem Oficial):</span>
          <span id="kitchenProgressBadge" class="text-emerald-500">0/0</span>
        </div>
        <div id="kitchenTrayBuilt" class="flex flex-wrap gap-1.5 min-h-[34px] items-center text-[11px] font-bold text-muted-pro">
          Toque no 1º ingrediente abaixo para iniciar a montagem!
        </div>
      </div>
      <div id="kitchenChoicesGrid" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
      <div id="kitchenFeedback" class="hidden p-3 rounded-2xl text-xs font-extrabold text-center"></div>
    `;
    tabQuiz.insertBefore(kitchenCard, tabQuiz.children[2]);
    initKitchenGame();
  }

  updateEventCountdown();
  setInterval(updateEventCountdown, 1000);
}

function updateEventCountdown() {
  const diff = EVENT_END_TIMESTAMP - Date.now();
  const topEl = $("countdownTimerText"), printEl = $("printCountdownSpan");
  if (diff <= 0) {
    const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
    const champ = list[0] ? list[0].name : "1º Colocado";
    if (topEl) topEl.textContent = `🏆 ENCERRADO! Campeão: ${champ}`;
    if (printEl) printEl.textContent = `ENCERRADO EM 25/10 • 🏆 Campeão(ã): ${champ}`;
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const str = `Faltam ${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (topEl) topEl.textContent = `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  if (printEl) printEl.textContent = str;
}

// =========================================================================
// 🍔 LÓGICA DO SISTEMA DE COZINHA ("MONTA-LANCHE")
// =========================================================================
function selectKitchenRecipe(id) {
  playTabClickSound();
  activeRecipe = KITCHEN_RECIPES.find(r => r.id === id) || KITCHEN_RECIPES[0];
  resetKitchenGame();
}

function initKitchenGame() {
  activeRecipe = KITCHEN_RECIPES[0];
  resetKitchenGame();
}

function resetKitchenGame() {
  currentRecipeStep = 0;
  const fb = $("kitchenFeedback");
  if (fb) fb.classList.add("hidden");
  renderKitchenState();
}

function renderKitchenState() {
  const tray = $("kitchenTrayBuilt"), badge = $("kitchenProgressBadge"), grid = $("kitchenChoicesGrid");
  if (!tray || !grid) return;

  const total = activeRecipe.steps.length;
  badge.textContent = `${currentRecipeStep}/${total} etapas`;

  if (currentRecipeStep === 0) {
    tray.innerHTML = `<span class="text-xs text-muted-pro">Clique nos ingredientes abaixo na sequência oficial de montagem:</span>`;
  } else {
    tray.innerHTML = activeRecipe.steps.slice(0, currentRecipeStep).map((st, i) =>
      `<span class="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-extrabold text-[10px]">${i + 1}. ${st} ✅</span>`
    ).join("");
  }

  const remaining = activeRecipe.steps.slice(currentRecipeStep);
  const shuffled = [...remaining].sort(() => 0.5 - Math.random());

  grid.innerHTML = "";
  shuffled.forEach(stepName => {
    const btn = document.createElement("button");
    btn.className = "option-btn p-3 rounded-2xl font-extrabold text-xs text-left flex items-center justify-between gap-2";
    btn.innerHTML = `<span>🥗 ${stepName}</span><span class="text-[10px] text-amber-500 font-black">+</span>`;
    btn.onclick = () => handleKitchenStepClick(btn, stepName);
    grid.appendChild(btn);
  });
}

function handleKitchenStepClick(btn, chosenStep) {
  const expected = activeRecipe.steps[currentRecipeStep];
  const fb = $("kitchenFeedback");

  if (chosenStep === expected) {
    currentRecipeStep++;
    if (currentRecipeStep >= activeRecipe.steps.length) {
      renderKitchenState();
      addXp(activeRecipe.xp);
      fb.classList.remove("hidden");
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold text-center bg-emerald-500/20 text-emerald-500 border border-emerald-500/40";
      fb.innerHTML = `🎉 <strong>Padrão Ouro Best Burger!</strong> Você montou o <strong>${activeRecipe.name}</strong> perfeitamente e ganhou <strong>+${activeRecipe.xp} XP</strong>![cite: 1]`;
    } else {
      playCardFlipSound();
      renderKitchenState();
    }
  } else {
    playWrongAnswerSound();
    btn.className = "anim-shake-wrong p-3 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs text-left";
    fb.classList.remove("hidden");
    fb.className = "p-3 rounded-2xl text-xs font-extrabold text-center bg-red-500/15 text-red-500 border border-red-500/30";
    fb.innerHTML = `❌ Ordem incorreta! O próximo item oficial é: <span class="underline">${expected}</span>`;
  }
}

// =========================================================================
// FOTOS DA GALERIA, PRINT DO RANKING E TEMA
// =========================================================================
function isPhotoAvatar(val) { return typeof val === "string" && val.startsWith("data:image/"); }

function renderAvatarBadge(avatarVal, sizeClasses = "w-10 h-10", textClasses = "text-xl", extraClasses = "pro-card") {
  const val = avatarVal || "🍔";
  return isPhotoAvatar(val)
    ? `<img src="${val}" alt="Foto" class="${sizeClasses} rounded-2xl object-cover border-2 border-[#FFC72C] shadow-sm shrink-0" />`
    : `<div class="${sizeClasses} rounded-2xl ${extraClasses} flex items-center justify-center ${textClasses} shrink-0">${val}</div>`;
}

function triggerPhotoUpload(targetMode) {
  playTabClickSound();
  photoUploadTarget = targetMode;
  const input = $("hiddenGalleryInput");
  if (input) { input.value = ""; input.click(); }
}

function handleGalleryFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 110; canvas.height = 110;
      const minDim = Math.min(img.width, img.height);
      canvas.getContext("2d").drawImage(img, (img.width - minDim) / 2, (img.height - minDim) / 2, minDim, minDim, 0, 0, 110, 110);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.74);
      playHitSuccessSound();
      if (photoUploadTarget === "register") {
        selectedRegAvatar = dataUrl; renderAvatarSelector();
      } else if (currentUserKey && users[currentUserKey]) {
        users[currentUserKey].avatar = dataUrl; users[currentUserKey].updatedAt = Date.now();
        closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function captureAndShareRankingImage() {
  playTabClickSound();
  const printArea = $("rankingPrintArea"), btn = $("btnPrintRanking");
  if (!printArea || typeof html2canvas === "undefined") return shareMyScoreWhatsApp();
  const orig = btn.innerHTML;
  btn.innerHTML = `<span>⏳ Gerando Print...</span>`; btn.disabled = true;
  try {
    const canvas = await html2canvas(printArea, { scale: 2, useCORS: true, backgroundColor: document.body.classList.contains("dark-mode") ? "#131b2e" : "#ffffff" });
    canvas.toBlob(async blob => {
      btn.innerHTML = orig; btn.disabled = false;
      if (!blob) return;
      const file = new File([blob], "Ranking_Olimpiadas_Mequi.png", { type: "image/png" });
      const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const top3 = list.slice(0, 3).map((u, i) => `${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} ${u.name}: ${u.xp || 0} XP`).join("\n");
      const caption = `🏆 *RANKING OFICIAL — OLIMPÍADAS DO BÁSICO (FINALIZA 25/10)*\n\n${top3}\n\n🔗 Link: ${window.location.origin}${window.location.pathname}`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Ranking Méqui", text: caption }); return; } catch (e) {}
      }
      const a = document.createElement("a"); a.download = "Ranking_Olimpiadas_Mequi.png"; a.href = URL.createObjectURL(blob); a.click();
      window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, "_blank");
    }, "image/png");
  } catch (e) { btn.innerHTML = orig; btn.disabled = false; shareMyScoreWhatsApp(); }
}

function initTheme() {
  if (localStorage.getItem(STORAGE_THEME_KEY) === "dark") {
    document.body.classList.add("dark-mode");
    if ($("themeToggleBtn")) $("themeToggleBtn").textContent = "☀️";
  }
}

function toggleDarkMode() {
  playTabClickSound();
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem(STORAGE_THEME_KEY, isDark ? "dark" : "light");
  if ($("themeToggleBtn")) $("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
}

function showXpToast(amount) {
  const c = $("xpToastContainer");
  if (!c) return;
  const t = document.createElement("div");
  t.className = "xp-toast gold-gradient text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-xl border-2 border-white";
  t.textContent = `+${amount} XP ⚡`;
  c.appendChild(t); setTimeout(() => t.remove(), 1250);
}

// =========================================================================
// SINCRONIZAÇÃO EM TEMPO REAL E RESGATE DE CONTAS
// =========================================================================
function startHeartbeat() {
  if (heartbeatIntervalId) clearInterval(heartbeatIntervalId);
  heartbeatIntervalId = setInterval(() => {
    if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
      users[currentUserKey].lastSeen = Date.now();
      scheduleCloudSync(currentUserKey, false);
    }
  }, 10000);
}

function rescuePreviousLocalRegistrations() {
  ["mequi_olimpiadas_users_v3", "mequi_olimpiadas_users_v4", "mequi_olimpiadas_users_v5", "mequi_olimpiadas_users_v6"].forEach(k => {
    try {
      const parsed = JSON.parse(localStorage.getItem(k) || "null");
      if (parsed && typeof parsed === "object") {
        Object.keys(parsed).forEach(uk => {
          const u = parsed[uk];
          if (!u || !u.name) return;
          users[uk] = mergeSingleUser(users[uk], {
            ...u, role: u.role || u.station || "Atendente", avatar: u.avatar || "🍔",
            hearts: u.hearts !== undefined ? u.hearts : 5, heartsLockUntil: u.heartsLockUntil || 0,
            mistakes: Array.isArray(u.mistakes) ? u.mistakes : [], lastSeen: u.lastSeen || 0, updatedAt: u.updatedAt || Date.now()
          });
        });
      }
    } catch (e) {}
  });
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function mergeSingleUser(ex, inc) {
  if (!ex) return inc;
  if ((inc.adminOverrideAt || 0) > (ex.adminOverrideAt || 0)) return inc;
  if ((ex.adminOverrideAt || 0) > (inc.adminOverrideAt || 0)) return ex;
  if (inc._deleted && (inc.updatedAt || 0) >= (ex.updatedAt || 0)) return inc;
  const newer = (inc.updatedAt || 0) >= (ex.updatedAt || 0);
  return {
    ...ex, ...inc, _deleted: false,
    role: inc.role || ex.role || "Atendente",
    avatar: (newer && inc.avatar) ? inc.avatar : (ex.avatar || inc.avatar || "🍔"),
    xp: Math.max(ex.xp || 0, inc.xp || 0),
    correctAnswers: Math.max(ex.correctAnswers || 0, inc.correctAnswers || 0),
    hearts: newer && inc.hearts !== undefined ? inc.hearts : (ex.hearts !== undefined ? ex.hearts : 5),
    heartsLockUntil: newer && inc.heartsLockUntil !== undefined ? inc.heartsLockUntil : (ex.heartsLockUntil || 0),
    mistakes: newer && Array.isArray(inc.mistakes) ? inc.mistakes : (Array.isArray(ex.mistakes) ? ex.mistakes : []),
    lastSeen: Math.max(ex.lastSeen || 0, inc.lastSeen || 0),
    updatedAt: Math.max(ex.updatedAt || 0, inc.updatedAt || 0)
  };
}

function mergeUserDictionaries(loc, rem) {
  const m = { ...loc };
  if (rem && typeof rem === "object") {
    Object.keys(rem).forEach(k => { if (rem[k] && rem[k].name) m[k] = mergeSingleUser(m[k], rem[k]); });
  }
  return m;
}

function refreshUIIfNeeded() {
  updateHeaderUI(); syncActiveUserHeartsState(); updateMistakesBadge(); populateDuelOpponentList(); renderDuelHistory();
  const sorted = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const hash = JSON.stringify(sorted.map(u => `${u.name}:${u.xp}:${u.correctAnswers}:${(u.avatar || "").slice(-15)}:${u.role}:${u.lastSeen || 0}`));
  if (hash !== lastLeaderboardHash) { lastLeaderboardHash = hash; renderLeaderboard(); }
  if (isAdminUnlocked && hash !== lastAdminListHash) { lastAdminListHash = hash; renderAdminUsersList(); }
}

function initClusterSync() {
  ["wss://broker.emqx.io:8084/mqtt", "wss://broker.hivemq.com:8884/mqtt"].forEach(url => {
    try {
      const client = mqtt.connect(url, { clientId: "mq78_" + Math.random().toString(16).slice(2, 10), clean: true, connectTimeout: 5000, reconnectPeriod: 6000 });
      client.on("connect", () => {
        if ($("syncStatusText")) $("syncStatusText").textContent = "● Conectado em Tempo Real (Finaliza 25/10)";
        client.subscribe(SYNC_MQTT_TOPIC); client.subscribe(DUEL_MQTT_TOPIC);
      });
      client.on("message", (topic, msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (topic === SYNC_MQTT_TOPIC) {
            users = mergeUserDictionaries(users, data);
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
            refreshUIIfNeeded();
          } else if (topic === DUEL_MQTT_TOPIC) handleIncomingDuelPacket(data);
        } catch (e) {}
      });
      mqttClients.push(client);
    } catch (e) {}
  });
}

function publishDuelPacket(pkt) {
  const p = JSON.stringify(pkt);
  mqttClients.forEach(c => { if (c && c.connected) try { c.publish(DUEL_MQTT_TOPIC, p); } catch (e) {} });
}

function scheduleCloudSync(keyToPush, immediate = false) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  refreshUIIfNeeded();
  clearTimeout(cloudSyncQueueTimer);
  cloudSyncQueueTimer = setTimeout(() => {
    const full = JSON.stringify(users);
    mqttClients.forEach(c => { if (c && c.connected) try { c.publish(SYNC_MQTT_TOPIC, full, { retain: true }); } catch (e) {} });
    if (keyToPush && users[keyToPush]) {
      fetch(CLOUD_HTTP_URL, { method: "POST", body: JSON.stringify({ type: "single", k: keyToPush, u: users[keyToPush] }) }).catch(() => {});
    }
  }, immediate ? 150 : 3000);
}

async function fetchCloudHistorySafe(force = false) {
  if (!force && Date.now() - lastHttpFetchTime < 20000) return;
  lastHttpFetchTime = Date.now();
  try {
    const res = await fetch(`${CLOUD_HTTP_URL}/json?poll=1&since=all`);
    if (res.ok) {
      const lines = (await res.text()).trim().split("\n");
      lines.forEach(l => {
        try {
          const pkt = JSON.parse(l);
          if (pkt.event === "message" && pkt.message) {
            const d = JSON.parse(pkt.message);
            if (d.type === "single" && d.k && d.u) users[d.k] = mergeSingleUser(users[d.k], d.u);
          }
        } catch (e) {}
      });
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
      refreshUIIfNeeded();
    }
  } catch (e) {}
}

function forceSyncNow() {
  playTabClickSound();
  if (currentUserKey && users[currentUserKey]) scheduleCloudSync(currentUserKey, true);
  fetchCloudHistorySafe(true);
}

// =========================================================================
// PATENTES, PERFIL E AUTENTICAÇÃO
// =========================================================================
function getLevelInfo(xp) {
  if (xp >= 25000) return { level: 7, title: "👑 Nível 7 — Lenda dos Arcos Dourados", min: 25000, max: 40000 };
  if (xp >= 15000) return { level: 6, title: "🔥 Nível 6 — Mestre das Olimpíadas", min: 15000, max: 25000 };
  if (xp >= 10000) return { level: 5, title: "💎 Nível 5 — Diamante Best Burger", min: 10000, max: 15000 };
  if (xp >= 6000)  return { level: 4, title: "🥇 Nível 4 — Padrão Ouro Venture", min: 6000, max: 10000 };
  if (xp >= 3000)  return { level: 3, title: "🥈 Nível 3 — Especialista de Prata", min: 3000, max: 6000 };
  if (xp >= 1000)  return { level: 2, title: "🥉 Nível 2 — Chapa de Bronze", min: 1000, max: 3000 };
  return { level: 1, title: "🔰 Nível 1 — Iniciante", min: 0, max: 1000 };
}

function renderAvatarSelector() {
  const grid = $("regAvatarGrid");
  if (!grid) return;
  const custom = isPhotoAvatar(selectedRegAvatar);
  grid.innerHTML = `<div class="col-span-6 mb-1">
    <button type="button" onclick="triggerPhotoUpload('register')" class="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed ${custom ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500/50 bg-red-500/5'} flex items-center justify-center gap-2 text-xs font-extrabold btn-tap">
      ${custom ? `<img src="${selectedRegAvatar}" class="w-8 h-8 rounded-xl object-cover" /> <span class="text-emerald-500">✅ Foto Selecionada</span>` : `<span>📸 Enviar Foto da Galeria / PC</span>`}
    </button></div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="selectRegAvatar('${ic}')" class="avatar-option p-2 rounded-2xl border-2 subtle-box text-xl flex items-center justify-center ${ic === selectedRegAvatar ? 'selected' : ''}">${ic}</button>`).join("");
}

function selectRegAvatar(ic) { playTabClickSound(); selectedRegAvatar = ic; renderAvatarSelector(); }

function openAvatarModal() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  const cur = users[currentUserKey].avatar || "🍔";
  $("changeAvatarGrid").innerHTML = `<div class="col-span-4 mb-1">
    <button type="button" onclick="triggerPhotoUpload('profile')" class="w-full py-3 rounded-2xl text-slate-950 font-black text-xs btn-anim-yellow flex items-center justify-center gap-2">📸 Escolher Foto da Galeria / PC</button>
  </div>` + AVATAR_LIST.map(ic => `<button type="button" onclick="changeUserAvatar('${ic}')" class="p-3 rounded-2xl border-2 ${ic === cur ? 'border-red-600 bg-red-500/15' : 'subtle-box'} text-2xl flex items-center justify-center btn-tap">${ic}</button>`).join("");
  $("avatarPickerModal").classList.remove("hidden");
}

function closeAvatarModal() { playTabClickSound(); $("avatarPickerModal").classList.add("hidden"); }
function changeUserAvatar(ic) {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  users[currentUserKey].avatar = ic; users[currentUserKey].updatedAt = Date.now();
  closeAvatarModal(); scheduleCloudSync(currentUserKey, true);
}

function switchAuthTab(mode) {
  playTabClickSound(); $("authError").classList.add("hidden");
  $("loginForm").classList.toggle("hidden", mode !== "login");
  $("registerForm").classList.toggle("hidden", mode === "login");
  $("tabLoginBtn").className = mode === "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
  $("tabRegisterBtn").className = mode !== "login" ? "flex-1 py-2.5 text-xs font-extrabold rounded-xl bg-[#DA291C] text-white" : "flex-1 py-2.5 text-xs font-extrabold rounded-xl text-muted-pro";
}

function showAuthError(msg) { playWrongAnswerSound(); const e = $("authError"); e.textContent = msg; e.classList.remove("hidden"); }

function handleRegister() {
  const name = $("regName").value.trim().toUpperCase(), role = $("regRole").value, pass = $("regPass").value.trim();
  if (name.length < 2) return showAuthError("Digite seu nome válido.");
  if (pass.length < 4) return showAuthError("A senha precisa ter pelo menos 4 dígitos.");
  const key = name.toLowerCase();
  users[key] = {
    name, role, avatar: selectedRegAvatar, password: pass, _deleted: false,
    xp: users[key] && !users[key]._deleted ? (users[key].xp || 0) : 0,
    correctAnswers: users[key] && !users[key]._deleted ? (users[key].correctAnswers || 0) : 0,
    hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [], lastSeen: Date.now(), updatedAt: Date.now()
  };
  currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden"); playHitSuccessSound();
  syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}

async function handleLogin() {
  const rawName = $("loginName").value.trim(), pass = $("loginPass").value.trim();
  if (!rawName) return showAuthError("Digite seu nome para entrar!");
  const key = rawName.toLowerCase(), btn = $("btnLoginSubmit");
  btn.textContent = "ENTRANDO..."; btn.disabled = true;
  if (!users[key]) await fetchCloudHistorySafe(true);
  btn.textContent = "ENTRAR NO TREINAMENTO 🚀"; btn.disabled = false;

  if (pass === ADMIN_SECRET_PASS) {
    if (!users[key]) {
      users[key] = { name: rawName.toUpperCase(), role: "Treinador", avatar: "👑", password: pass, xp: 0, correctAnswers: 0, hearts: 5, heartsLockUntil: 0, mistakes: [], lastSeen: Date.now(), updatedAt: Date.now() };
    }
    users[key]._deleted = false; currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
    $("authModal").classList.add("hidden"); playHitSuccessSound();
    syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
    return;
  }
  if (!users[key] || users[key]._deleted) return showAuthError("Conta não encontrada! Clique em 'CRIAR CONTA' acima.");
  if (users[key].password && users[key].password !== pass) return showAuthError("Senha incorreta!");

  currentUserKey = key; localStorage.setItem(STORAGE_CURRENT_KEY, key);
  $("authModal").classList.add("hidden"); playHitSuccessSound();
  syncActiveUserHeartsState(); loadNextQuizQuestion(); scheduleCloudSync(key, true);
}

function logoutUser() {
  playTabClickSound(); currentUserKey = null; localStorage.removeItem(STORAGE_CURRENT_KEY);
  $("loginPass").value = ""; $("authModal").classList.remove("hidden");
}

function addXp(amount) {
  if (!currentUserKey || !users[currentUserKey]) { playHitSuccessSound(); return; }
  const oldXp = users[currentUserKey].xp || 0, newXp = Math.max(0, oldXp + amount);
  users[currentUserKey].xp = newXp; users[currentUserKey].updatedAt = Date.now();
  showXpToast(amount);
  if (getLevelInfo(newXp).level > getLevelInfo(oldXp).level) playMcDonaldsJingle();
  else playHitSuccessSound();
  scheduleCloudSync(currentUserKey, false);
}

function updateHeaderUI() {
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey], info = getLevelInfo(u.xp || 0), av = $("userAvatarDisplay");
  if (av) av.innerHTML = isPhotoAvatar(u.avatar) ? `<img src="${u.avatar}" alt="Foto" class="w-full h-full object-cover" />` : (u.avatar || "🍔");
  $("userNameDisplay").textContent = u.name;
  $("userRoleBadge").textContent = u.role || "Atendente";
  $("userXpDisplay").textContent = `${u.xp || 0} XP`;
  $("userRankTitle").textContent = info.title;
  $("currentLevelNum").textContent = `Nível ${info.level}`;
  $("statHitsDisplay").textContent = `${u.correctAnswers || 0} ✅`;
  const progress = Math.min(100, Math.round((((u.xp || 0) - info.min) / (info.max - info.min)) * 100));
  $("xpProgressBar").style.width = `${Math.max(6, progress)}%`;
  $("nextLevelTarget").textContent = info.level < 7 ? `Faltam ${info.max - (u.xp || 0)} XP para o Nível ${info.level + 1}` : `Patente Máxima Alcançada! 👑`;
}

// =========================================================================
// CADERNO "REVISAR MINHAS DÚVIDAS"
// =========================================================================
function getActiveUserMistakes() {
  if (currentUserKey && users[currentUserKey]) {
    if (!Array.isArray(users[currentUserKey].mistakes)) users[currentUserKey].mistakes = [];
    return users[currentUserKey].mistakes;
  }
  return JSON.parse(localStorage.getItem("mequi_guest_mistakes") || "[]");
}
function recordMistakeQuestion(qId) {
  const list = getActiveUserMistakes();
  if (!list.includes(qId)) { list.push(qId); saveMistakesList(list); }
}
function removeMistakeQuestion(qId) { saveMistakesList(getActiveUserMistakes().filter(id => id !== qId)); }
function saveMistakesList(list) {
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].mistakes = list; users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else localStorage.setItem("mequi_guest_mistakes", JSON.stringify(list));
  updateMistakesBadge();
}
function updateMistakesBadge() {
  const b = $("mistakesCountBadge");
  if (!b) return;
  const c = getActiveUserMistakes().length;
  b.textContent = `${c} pendente${c === 1 ? "" : "s"}`;
  b.className = c > 0 ? "text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white" : "text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500";
}
function openReviewModal() {
  playTabClickSound();
  if (getActiveUserMistakes().length === 0) return alert("🎉 Você não tem nenhuma dúvida pendente!");
  $("reviewMistakesModal").classList.remove("hidden"); loadNextReviewQuestion();
}
function closeReviewModal() { playTabClickSound(); $("reviewMistakesModal").classList.add("hidden"); }

function loadNextReviewQuestion() {
  playTabClickSound();
  const mistakes = getActiveUserMistakes();
  if (mistakes.length === 0) { playMcDonaldsJingle(); alert("✅ Você zerou todas as suas dúvidas!"); closeReviewModal(); return; }
  const item = QUESTIONS_DB.find(q => q.id === mistakes[Math.floor(Math.random() * mistakes.length)]) || QUESTIONS_DB[0];
  $("reviewMetaBadge").textContent = `Questão #${item.id} • ${item.level}`;
  $("reviewRemainingBadge").textContent = `Faltam zerar: ${mistakes.length}`;
  $("reviewQuestionText").textContent = item.q;
  $("reviewFeedbackBox").classList.add("hidden"); $("nextReviewBtn").classList.add("hidden");
  const container = $("reviewOptionsContainer"); container.innerHTML = "";
  [...item.w, item.a].sort(() => 0.5 - Math.random()).forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${["A","B","C","D"][idx]}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => checkReviewAnswer(btn, optText, item.a, item.id);
    container.appendChild(btn);
  });
}

function checkReviewAnswer(selectedBtn, chosen, correct, qId) {
  document.querySelectorAll("#reviewOptionsContainer button").forEach(b => b.disabled = true);
  const fb = $("reviewFeedbackBox"); fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3";
    removeMistakeQuestion(qId); playHitSuccessSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500";
    fb.textContent = "✅ Aprendido! Questão removida das dúvidas!";
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    playWrongAnswerSound();
    fb.className = "p-3 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
    fb.innerHTML = `❌ Gabarito oficial:<br><span class="underline mt-1 inline-block">${correct}</span>`;
  }
  $("nextReviewBtn").classList.remove("hidden");
}

// =========================================================================
// DUELO ONLINE 1 vs 1 + HISTÓRICO
// =========================================================================
function populateDuelOpponentList() {
  const select = $("duelOpponentSelect");
  if (!select) return;
  const cur = select.value, now = Date.now();
  const list = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted && k !== currentUserKey).sort((a, b) => a[1].name.localeCompare(b[1].name));
  select.innerHTML = `<option value="">Selecione quem você quer desafiar...</option>` +
    list.map(([k, u]) => `<option value="${k}">${(now - (u.lastSeen || 0)) < 25000 ? "🟢 [Online]" : "⚪ [Offline]"} ${u.name} (${u.role || 'Atendente'})</option>`).join("");
  if (cur && users[cur]) select.value = cur;
}

function sendLiveDuelInvite() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return alert("Faça login antes de desafiar alguém!");
  const targetKey = $("duelOpponentSelect").value;
  if (!targetKey || !users[targetKey]) return alert("Selecione qual colega você quer desafiar!");
  const me = users[currentUserKey], opp = users[targetKey], duelId = "duel_" + Date.now();
  activeDuel = { duelId, isHost: true, hostKey: currentUserKey, hostName: me.name, hostAvatar: me.avatar || "🍔", guestKey: targetKey, guestName: opp.name, guestAvatar: opp.avatar || "🍟", scoreHost: 0, scoreGuest: 0, round: 0, status: "waiting" };
  openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden"); $("duelQuestionArea").classList.add("hidden"); $("duelWinnerBox").classList.add("hidden");
  $("duelWaitingText").textContent = `Aguardando ${opp.name} aceitar no celular dele(a)...`;
  publishDuelPacket({ type: "invite", ...activeDuel });
}

function sendDuelInviteWhatsApp() {
  playTabClickSound();
  if (!activeDuel) return;
  const text = `⚔️ *DESAFIO 1 vs 1 — OLIMPÍADAS DO BÁSICO*\n🔥 *${activeDuel.hostName}* está te chamando para um Duelo ao vivo!\n📲 Acesse: ${window.location.origin}${window.location.pathname}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function handleIncomingDuelPacket(pkt) {
  if (!pkt || !pkt.type) return;
  if (pkt.type === "invite" && pkt.guestKey === currentUserKey && !activeDuel) {
    pendingDuelInvite = pkt; playHitSuccessSound();
    $("inviteFromNameDisplay").textContent = pkt.hostName; $("duelInvitePopup").classList.remove("hidden");
    return;
  }
  if (!activeDuel || pkt.duelId !== activeDuel.duelId) return;
  if (pkt.type === "decline") { playWrongAnswerSound(); alert(`❌ ${activeDuel.guestName} recusou o duelo.`); leaveActiveDuel(false); return; }
  if (pkt.type === "accept" && activeDuel.isHost && activeDuel.status === "waiting") { activeDuel.status = "playing"; hostStartNextDuelRound(); return; }
  if (pkt.type === "question") {
    Object.assign(activeDuel, { status: "playing", round: pkt.round, scoreHost: pkt.scoreHost, scoreGuest: pkt.scoreGuest, currentQuestion: pkt.question, roundResolved: false, lockedPlayers: {} });
    playCardFlipSound(); renderDuelRoundUI(); return;
  }
  if (pkt.type === "answer" && activeDuel.status === "playing" && !activeDuel.roundResolved) {
    if (pkt.isCorrect) {
      activeDuel.roundResolved = true;
      if (pkt.playerKey === activeDuel.hostKey) activeDuel.scoreHost++; else activeDuel.scoreGuest++;
      updateDuelScoreboardUI(); playHitSuccessSound();
      showDuelBanner(`⚡ ${pkt.playerName} acertou primeiro e marcou +1 ponto!`, "emerald");
      if (activeDuel.isHost) {
        setTimeout(() => {
          if (!activeDuel) return;
          if (activeDuel.scoreHost >= 5 || activeDuel.scoreGuest >= 5) {
            publishDuelPacket({ type: "finish", duelId: activeDuel.duelId, winnerName: activeDuel.scoreHost >= 5 ? activeDuel.hostName : activeDuel.guestName, scoreHost: activeDuel.scoreHost, scoreGuest: activeDuel.scoreGuest });
          } else hostStartNextDuelRound();
        }, 1800);
      }
    } else {
      activeDuel.lockedPlayers[pkt.playerKey] = true; playWrongAnswerSound();
      showDuelBanner(pkt.playerKey === currentUserKey ? `❌ Você errou! Aguardando oponente...` : `🔥 ${pkt.playerName} errou! Sua chance!`, pkt.playerKey === currentUserKey ? "red" : "amber");
      if (activeDuel.lockedPlayers[activeDuel.hostKey] && activeDuel.lockedPlayers[activeDuel.guestKey]) {
        activeDuel.roundResolved = true;
        if (activeDuel.isHost) setTimeout(() => { if (activeDuel) hostStartNextDuelRound(); }, 1800);
      }
    }
    return;
  }
  if (pkt.type === "finish") {
    activeDuel.scoreHost = pkt.scoreHost; activeDuel.scoreGuest = pkt.scoreGuest;
    updateDuelScoreboardUI(); playMcDonaldsJingle();
    $("duelQuestionArea").classList.add("hidden"); $("duelWinnerBox").classList.remove("hidden");
    $("duelWinnerTitle").textContent = `🏆 ${pkt.winnerName} Venceu!`;
    $("duelWinnerSub").textContent = `Placar Final: ${activeDuel.hostName} (${pkt.scoreHost}) x (${pkt.scoreGuest}) ${activeDuel.guestName}`;
    saveDuelHistoryRecord({ p1: activeDuel.hostName, p2: activeDuel.guestName, score1: pkt.scoreHost, score2: pkt.scoreGuest, winner: pkt.winnerName, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    return;
  }
  if (pkt.type === "leave" && pkt.playerKey !== currentUserKey) { alert("O oponente saiu da Arena."); leaveActiveDuel(false); }
}

function saveDuelHistoryRecord(r) {
  duelHistoryList.unshift(r); if (duelHistoryList.length > 5) duelHistoryList.pop();
  localStorage.setItem(STORAGE_DUEL_HISTORY, JSON.stringify(duelHistoryList)); renderDuelHistory();
}
function renderDuelHistory() {
  const c = $("duelHistoryContainer");
  if (!c) return;
  c.innerHTML = duelHistoryList.length === 0
    ? `<div class="p-3 rounded-xl subtle-box text-xs text-center text-muted-pro">Nenhum duelo finalizado recentemente.</div>`
    : duelHistoryList.map(h => `<div class="flex items-center justify-between p-2.5 rounded-xl subtle-box text-xs font-bold"><span>⚔️ <strong>${h.p1}</strong> (${h.score1}) x (${h.score2}) <strong>${h.p2}</strong></span><span class="text-amber-500 font-black">🏆 ${h.winner} <small class="text-muted-pro">${h.date}</small></span></div>`).join("");
}

function acceptDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  activeDuel = { ...pendingDuelInvite, isHost: false, scoreHost: 0, scoreGuest: 0, round: 0, status: "playing" };
  pendingDuelInvite = null; openDuelArenaUI();
  $("duelWaitingBox").classList.remove("hidden"); $("duelWaitingText").textContent = "Sorteando 1ª pergunta...";
  publishDuelPacket({ type: "accept", duelId: activeDuel.duelId });
}
function declineDuelInvite() {
  playTabClickSound();
  if (!pendingDuelInvite) return;
  $("duelInvitePopup").classList.add("hidden");
  publishDuelPacket({ type: "decline", duelId: pendingDuelInvite.duelId }); pendingDuelInvite = null;
}
function openDuelArenaUI() { if (activeDuel) { $("duelArenaModal").classList.remove("hidden"); updateDuelScoreboardUI(); } }
function updateDuelScoreboardUI() {
  if (!activeDuel) return;
  if ($("duelP1Avatar")) $("duelP1Avatar").innerHTML = isPhotoAvatar(activeDuel.hostAvatar) ? `<img src="${activeDuel.hostAvatar}" class="w-9 h-9 rounded-xl object-cover mx-auto" />` : activeDuel.hostAvatar;
  if ($("duelP2Avatar")) $("duelP2Avatar").innerHTML = isPhotoAvatar(activeDuel.guestAvatar) ? `<img src="${activeDuel.guestAvatar}" class="w-9 h-9 rounded-xl object-cover mx-auto" />` : activeDuel.guestAvatar;
  $("duelP1Name").textContent = activeDuel.hostName; $("duelP1Score").textContent = activeDuel.scoreHost;
  $("duelP2Name").textContent = activeDuel.guestName; $("duelP2Score").textContent = activeDuel.scoreGuest;
  $("duelRoundBadge").textContent = `Rodada #${activeDuel.round || 1}`;
}
function hostStartNextDuelRound() {
  if (!activeDuel || !activeDuel.isHost) return;
  const item = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)];
  publishDuelPacket({ type: "question", duelId: activeDuel.duelId, round: (activeDuel.round || 0) + 1, scoreHost: activeDuel.scoreHost, scoreGuest: activeDuel.scoreGuest, question: { id: item.id, level: item.level, q: item.q, a: item.a, options: [...item.w, item.a].sort(() => 0.5 - Math.random()) } });
}
function renderDuelRoundUI() {
  if (!activeDuel || !activeDuel.currentQuestion) return;
  $("duelWaitingBox").classList.add("hidden"); $("duelWinnerBox").classList.add("hidden");
  $("duelQuestionArea").classList.remove("hidden"); $("duelStatusBanner").classList.add("hidden");
  updateDuelScoreboardUI();
  const qObj = activeDuel.currentQuestion;
  $("duelQuestionText").textContent = `(#${qObj.id}) ${qObj.q}`;
  const container = $("duelOptionsContainer"); container.innerHTML = "";
  qObj.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${["A","B","C","D"][idx]}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => submitDuelAnswer(btn, optText, qObj.a);
    container.appendChild(btn);
  });
}
function submitDuelAnswer(selectedBtn, chosen, correct) {
  if (!activeDuel || activeDuel.roundResolved || (activeDuel.lockedPlayers && activeDuel.lockedPlayers[currentUserKey])) return;
  document.querySelectorAll("#duelOptionsContainer button").forEach(b => b.disabled = true);
  const isCorrect = chosen === correct;
  selectedBtn.className = isCorrect ? "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3" : "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
  publishDuelPacket({ type: "answer", duelId: activeDuel.duelId, playerKey: currentUserKey, playerName: users[currentUserKey]?.name || "Jogador", isCorrect });
}
function showDuelBanner(msg, color) {
  const b = $("duelStatusBanner"); b.classList.remove("hidden");
  b.className = `p-3 rounded-2xl text-xs font-extrabold text-center bg-${color}-500/20 text-${color}-500 border border-${color}-500/40`;
  b.textContent = msg;
}
function leaveActiveDuel(notify = true) {
  playTabClickSound();
  if (activeDuel && notify) publishDuelPacket({ type: "leave", duelId: activeDuel.duelId, playerKey: currentUserKey });
  activeDuel = null; $("duelArenaModal").classList.add("hidden");
}

// =========================================================================
// CORAÇÕES E RECARGA DE 10 MINUTOS
// =========================================================================
function getActiveHeartsLockUntil() {
  if (currentUserKey && users[currentUserKey]) return users[currentUserKey].heartsLockUntil || 0;
  return parseInt(localStorage.getItem("mequi_guest_hearts_lock") || "0", 10);
}
function setActiveHeartsState(heartsVal, lockUntilVal) {
  currentHearts = heartsVal;
  if (currentUserKey && users[currentUserKey]) {
    users[currentUserKey].hearts = heartsVal; users[currentUserKey].heartsLockUntil = lockUntilVal; users[currentUserKey].updatedAt = Date.now();
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } else {
    localStorage.setItem("mequi_guest_hearts", String(heartsVal)); localStorage.setItem("mequi_guest_hearts_lock", String(lockUntilVal));
  }
  updateHeartsDisplay();
}
function syncActiveUserHeartsState() {
  const now = Date.now(); let lockUntil = getActiveHeartsLockUntil();
  currentHearts = (currentUserKey && users[currentUserKey] && users[currentUserKey].hearts !== undefined) ? users[currentUserKey].hearts : parseInt(localStorage.getItem("mequi_guest_hearts") || "5", 10);
  if (lockUntil > 0 && now >= lockUntil) { setActiveHeartsState(5, 0); lockUntil = 0; }
  updateHeartsDisplay(); checkAndRenderCooldownScreen();
}
function formatTimeRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(totalSec / 60)).padStart(2, "0")}:${String(totalSec % 60).padStart(2, "0")}`;
}
function checkAndRenderCooldownScreen() {
  const lockUntil = getActiveHeartsLockUntil(), now = Date.now();
  const cooldownBox = $("quizCooldownBox"), activeArea = $("quizActiveArea"), timerDisplay = $("cooldownTimerDisplay");
  if (lockUntil > now) {
    cooldownBox.classList.remove("hidden"); activeArea.classList.add("hidden"); timerDisplay.textContent = formatTimeRemaining(lockUntil - now);
    if (!cooldownIntervalId) {
      cooldownIntervalId = setInterval(() => {
        const rem = getActiveHeartsLockUntil() - Date.now();
        if (rem <= 0) {
          clearInterval(cooldownIntervalId); cooldownIntervalId = null; setActiveHeartsState(5, 0);
          cooldownBox.classList.add("hidden"); activeArea.classList.remove("hidden"); loadNextQuizQuestion();
          if (currentUserKey) scheduleCloudSync(currentUserKey, true);
        } else timerDisplay.textContent = formatTimeRemaining(rem);
      }, 1000);
    }
    return true;
  }
  if (cooldownIntervalId) { clearInterval(cooldownIntervalId); cooldownIntervalId = null; }
  if (currentHearts <= 0) setActiveHeartsState(5, 0);
  cooldownBox.classList.add("hidden"); activeArea.classList.remove("hidden");
  return false;
}
function changeQuizLevelFilter() { playTabClickSound(); currentStreak = 0; loadNextQuizQuestion(); }
function updateHeartsDisplay() {
  const safeHearts = Math.max(0, Math.min(5, currentHearts));
  if ($("quizHeartsInfo")) $("quizHeartsInfo").textContent = "❤️".repeat(safeHearts) + "🖤".repeat(5 - safeHearts);
}

function loadNextQuizQuestion() {
  playTabClickSound(); syncActiveUserHeartsState();
  if (checkAndRenderCooldownScreen()) return;
  const levelFilter = $("quizLevelFilter").value;
  const pool = levelFilter === "ALL" ? QUESTIONS_DB : QUESTIONS_DB.filter(item => item.level === levelFilter);
  const randomItem = pool[Math.floor(Math.random() * pool.length)];
  currentQuizQuestionId = randomItem.id;
  $("quizQuestionMeta").textContent = `Questão #${randomItem.id} • Nível ${randomItem.level}`;
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
  $("quizQuestionText").textContent = randomItem.q;
  $("quizFeedback").classList.add("hidden"); $("nextQuizBtn").classList.add("hidden");
  const container = $("quizOptions"); container.innerHTML = "";
  [...randomItem.w, randomItem.a].sort(() => 0.5 - Math.random()).forEach((optText, idx) => {
    const letter = ["A", "B", "C", "D"][idx], btn = document.createElement("button");
    btn.className = "option-btn w-full text-left p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3";
    btn.innerHTML = `<span class="w-7 h-7 rounded-xl subtle-box font-black text-xs flex items-center justify-center shrink-0">${letter}</span><span class="flex-1">${optText}</span>`;
    btn.onclick = () => checkQuizAnswer(btn, optText, randomItem.a, letter);
    container.appendChild(btn);
  });
}

function checkQuizAnswer(selectedBtn, chosen, correct, letter) {
  document.querySelectorAll("#quizOptions button").forEach(b => {
    b.disabled = true;
    if (b.innerText.includes(correct) && chosen !== correct) b.className = "w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/15 font-extrabold text-xs flex items-center gap-3";
  });
  const fb = $("quizFeedback"); fb.classList.remove("hidden");
  if (chosen === correct) {
    selectedBtn.className = "anim-pop-correct w-full text-left p-3.5 rounded-2xl border-2 border-emerald-500 bg-emerald-500/20 font-extrabold text-xs flex items-center gap-3 shadow-md";
    currentStreak++;
    if (currentUserKey && users[currentUserKey]) users[currentUserKey].correctAnswers = (users[currentUserKey].correctAnswers || 0) + 1;
    addXp(25);
    fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-emerald-500/15 text-emerald-500";
    fb.textContent = `✅ Alternativa ${letter} Correta! +25 XP!`;
    $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️"; $("nextQuizBtn").classList.remove("hidden");
  } else {
    selectedBtn.className = "anim-shake-wrong w-full text-left p-3.5 rounded-2xl border-2 border-red-500 bg-red-500/20 font-extrabold text-xs flex items-center gap-3";
    currentStreak = 0; playWrongAnswerSound();
    if (currentQuizQuestionId) recordMistakeQuestion(currentQuizQuestionId);
    const newHearts = Math.max(0, currentHearts - 1);
    if (newHearts <= 0) {
      setActiveHeartsState(0, Date.now() + HEARTS_COOLDOWN_MS);
      if (currentUserKey) scheduleCloudSync(currentUserKey, true);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
      fb.innerHTML = `💔 <strong>Seus 5 corações acabaram!</strong> Gabarito: <span class="underline">${correct}</span>`;
      $("nextQuizBtn").textContent = "VER CRONÔMETRO (10 MIN) ⏳"; $("nextQuizBtn").classList.remove("hidden");
    } else {
      setActiveHeartsState(newHearts, 0);
      if (currentUserKey) scheduleCloudSync(currentUserKey, false);
      fb.className = "p-3.5 rounded-2xl text-xs font-extrabold bg-red-500/15 text-red-500";
      fb.innerHTML = `❌ Perdeu 1 coração (${newHearts} ❤️ restantes). Salvo em <strong>Minhas Dúvidas</strong>.<br>Gabarito: <span class="underline">${correct}</span>`;
      $("nextQuizBtn").textContent = "PRÓXIMA PERGUNTA ➡️"; $("nextQuizBtn").classList.remove("hidden");
    }
  }
  $("statStreakDisplay").textContent = `${currentStreak} 🔥`;
}

// =========================================================================
// FLASHCARDS 3D, BOOK E RANKING
// =========================================================================
function loadRandomFlashcard() {
  playCardFlipSound();
  const inner = $("fcFlipInner"); if (!inner) return;
  inner.classList.remove("is-flipped");
  setTimeout(() => {
    const item = QUESTIONS_DB[Math.floor(Math.random() * QUESTIONS_DB.length)];
    $("fcMeta").textContent = `Questão #${item.id} (${item.level}) • Toque para girar 3D 🔄`;
    $("fcQuestion").textContent = item.q; $("fcAnswer").textContent = item.a;
  }, 150);
}
function flipFlashcard() { playCardFlipSound(); if ($("fcFlipInner")) $("fcFlipInner").classList.toggle("is-flipped"); }
function debouncedBookSearch() { clearTimeout(searchDebounceTimer); searchDebounceTimer = setTimeout(renderBookList, 150); }
function setBookFilter(lvl) {
  playTabClickSound(); currentBookFilter = lvl;
  ["ALL", "Básico", "Intermediário", "Avançado"].forEach(l => {
    if ($(`filter-${l}`)) $(`filter-${l}`).className = l === lvl ? "px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-red-600 text-white shrink-0" : "px-3.5 py-1.5 rounded-xl text-xs font-extrabold subtle-box shrink-0";
  });
  renderBookList();
}
function renderBookList() {
  const s = $("searchBookInput").value.toLowerCase();
  const filtered = QUESTIONS_DB.filter(x => (currentBookFilter === "ALL" || x.level === currentBookFilter) && (!s || x.q.toLowerCase().includes(s) || x.a.toLowerCase().includes(s) || String(x.id).includes(s)));
  $("bookCountBadge").textContent = `${filtered.length} questões`;
  $("bookQuestionsContainer").innerHTML = filtered.map(x => `
    <div class="pro-card rounded-2xl p-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500">Questão #${x.id} • ${x.level}</span>
        <button onclick="revealBookAnswer(this)" class="text-[11px] font-extrabold text-amber-500">Ver Resposta</button>
      </div>
      <p class="font-extrabold text-xs">${x.q}</p>
      <p class="hidden mt-2.5 pt-2.5 border-t border-slate-500/20 text-xs font-bold text-emerald-500">✅ ${x.a}</p>
    </div>`).join("");
}
function revealBookAnswer(btn) {
  playCardFlipSound();
  const ans = btn.parentElement.nextElementSibling.nextElementSibling;
  ans.classList.toggle("hidden");
  btn.textContent = ans.classList.contains("hidden") ? "Ver Resposta" : "Ocultar";
}

function renderLeaderboard() {
  const pod = $("podiumTop3Container"), cont = $("leaderboardContainer");
  const list = Object.values(users).filter(u => u && u.name && !u._deleted).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  if (list.length === 0) {
    if (pod) pod.innerHTML = "";
    if (cont) cont.innerHTML = `<div class="p-6 text-center text-xs font-bold text-muted-pro subtle-box rounded-2xl">Nenhum colaborador cadastrado ainda.</div>`;
    return;
  }
  const [first, second, third] = list;
  if (pod) {
    pod.innerHTML = `
      <div class="flex flex-col items-center">${second ? `${renderAvatarBadge(second.avatar,"w-11 h-11","text-xl","subtle-box")}<p class="font-black text-[10px] truncate w-full text-center mt-1">${second.name}</p><span class="text-[10px] font-extrabold text-red-500">${second.xp||0} XP</span><div class="w-full h-16 mt-2 rounded-t-2xl bg-slate-300 text-slate-900 flex flex-col items-center justify-center font-black"><span>🥈</span><span class="text-[10px]">2º Lugar</span></div>` : ``}</div>
      <div class="flex flex-col items-center"><span class="text-lg float-slow">👑 ☕</span>${renderAvatarBadge(first.avatar,"w-14 h-14","text-2xl","gold-gradient text-slate-950")}<p class="font-black text-xs truncate w-full text-center mt-1">${first.name}</p><span class="text-[11px] font-black text-amber-500">${first.xp||0} XP</span><div class="w-full h-24 mt-2 rounded-t-2xl gold-gradient text-slate-950 flex flex-col items-center justify-center font-black"><span>🥇</span><span class="text-[11px]">1º LUGAR</span></div></div>
      <div class="flex flex-col items-center">${third ? `${renderAvatarBadge(third.avatar,"w-11 h-11","text-xl","subtle-box")}<p class="font-black text-[10px] truncate w-full text-center mt-1">${third.name}</p><span class="text-[10px] font-extrabold text-red-500">${third.xp||0} XP</span><div class="w-full h-14 mt-2 rounded-t-2xl bg-amber-700 text-white flex flex-col items-center justify-center font-black"><span>🥉</span><span class="text-[10px]">3º Lugar</span></div>` : ``}</div>`;
  }
  if (cont) {
    const now = Date.now();
    cont.innerHTML = list.map((u, idx) => {
      const medal = idx === 0 ? "🥇 ☕" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`;
      const dot = (now - (u.lastSeen || 0)) < 25000 ? `<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block ml-1"></span>` : `<span class="w-2.5 h-2.5 bg-slate-400/40 rounded-full inline-block ml-1"></span>`;
      return `<div class="flex items-center justify-between p-3.5 rounded-2xl ${idx === 0 ? 'bg-amber-500/15 border-2 border-amber-500/50' : 'subtle-box'}">
        <div class="flex items-center gap-3"><span class="font-black text-xs w-7 text-center">${medal}</span>${renderAvatarBadge(u.avatar)}<div><p class="font-black text-xs">${u.name} ${dot} <span class="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 uppercase">${u.role||'Atendente'}</span></p><p class="text-[10px] text-muted-pro font-bold">${getLevelInfo(u.xp||0).title}</p></div></div>
        <div class="text-right"><span class="font-black text-xs text-red-500">${u.xp||0} XP</span><span class="block text-[10px] text-muted-pro">${u.correctAnswers||0} acertos</span></div>
      </div>`;
    }).join("");
  }
}

function shareMyScoreWhatsApp() {
  playTabClickSound();
  if (!currentUserKey || !users[currentUserKey]) return;
  const u = users[currentUserKey];
  const text = `🏆 *OLIMPÍADAS DO BÁSICO — VENTURE (FINALIZA 25/10)*\n👤 Colaborador: *${u.name}*\n⚡ Pontuação: *${u.xp || 0} XP* (${getLevelInfo(u.xp || 0).title})\n✅ Acertos: ${u.correctAnswers || 0}\n🔗 ${window.location.origin}${window.location.pathname}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function unlockAdminPanel() {
  const pass = $("adminPassInput").value.trim();
  if (pass === ADMIN_SECRET_PASS) {
    isAdminUnlocked = true; playHitSuccessSound(); $("adminAuthError").classList.add("hidden");
    $("adminLockScreen").classList.add("hidden"); $("adminDashboard").classList.remove("hidden");
    renderAdminUsersList(); fetchCloudHistorySafe(true);
  } else { playWrongAnswerSound(); $("adminAuthError").classList.remove("hidden"); }
}
function lockAdminPanel() {
  playTabClickSound(); isAdminUnlocked = false; $("adminPassInput").value = "";
  $("adminDashboard").classList.add("hidden"); $("adminLockScreen").classList.remove("hidden");
}
function renderAdminUsersList() {
  const entries = Object.entries(users).filter(([k, u]) => u && u.name && !u._deleted).sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0));
  $("adminStatsSummary").textContent = `Total: ${entries.length} colaborador(es)`;
  $("adminUsersList").innerHTML = entries.map(([key, u], i) => `
    <div class="p-4 rounded-2xl subtle-box space-y-2">
      <div class="flex items-center justify-between"><div class="flex items-center gap-2">${renderAvatarBadge(u.avatar)}<div><h4 class="font-black text-xs">#${i+1} ${u.name} (${u.role||'Atendente'})</h4><p class="text-[10px] text-muted-pro">🔑 Senha: ${u.password||'1234'}</p></div></div><span class="font-black text-xs text-red-500">${u.xp||0} XP</span></div>
      <div class="flex flex-wrap gap-1.5 pt-2 border-t border-slate-500/20">
        <button onclick="adminAdjustXp('${key}', 100)" class="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-[10px]">+100 XP</button>
        <button onclick="adminAdjustXp('${key}', 500)" class="px-2.5 py-1 rounded-xl bg-emerald-800 text-white font-black text-[10px]">+500 XP</button>
        <button onclick="adminAdjustXp('${key}', -100)" class="px-2.5 py-1 rounded-xl bg-amber-600 text-white font-black text-[10px]">-100 XP</button>
        <button onclick="adminSetCustomXp('${key}')" class="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-black text-[10px]">✏️ Definir XP</button>
        <button onclick="adminRestoreHearts('${key}')" class="px-2.5 py-1 rounded-xl bg-pink-600 text-white font-black text-[10px]">❤️ Vidas</button>
        <button onclick="adminResetUser('${key}')" class="px-2.5 py-1 rounded-xl bg-slate-500/20 font-bold text-[10px]">Zerar</button>
        <button onclick="adminDeleteUser('${key}')" class="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-500 font-bold text-[10px] ml-auto">🗑️</button>
      </div>
    </div>`).join("");
}
function adminRestoreHearts(k) {
  playHitSuccessSound();
  if (!users[k]) return;
  users[k].hearts = 5; users[k].heartsLockUntil = 0; users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
  if (k === currentUserKey) { setActiveHeartsState(5, 0); checkAndRenderCooldownScreen(); loadNextQuizQuestion(); }
  scheduleCloudSync(k, true); renderAdminUsersList();
}
function adminAdjustXp(k, d) {
  if (!users[k]) return;
  const oldL = getLevelInfo(users[k].xp || 0).level;
  users[k].xp = Math.max(0, (users[k].xp || 0) + d);
  users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
  if (getLevelInfo(users[k].xp).level > oldL) playMcDonaldsJingle(); else if (d > 0) playHitSuccessSound(); else playTabClickSound();
  scheduleCloudSync(k, true);
}
function adminSetCustomXp(k) {
  playTabClickSound();
  if (!users[k]) return;
  const v = prompt(`Novo XP para ${users[k].name}:`, users[k].xp || 0);
  if (v !== null && !isNaN(parseInt(v, 10))) {
    const oldL = getLevelInfo(users[k].xp || 0).level;
    users[k].xp = Math.max(0, parseInt(v, 10)); users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now();
    if (getLevelInfo(users[k].xp).level > oldL) playMcDonaldsJingle(); else playHitSuccessSound();
    scheduleCloudSync(k, true);
  }
}
function adminResetUser(k) {
  playTabClickSound();
  if (users[k] && confirm(`Zerar XP de ${users[k].name}?`)) {
    users[k].xp = 0; users[k].correctAnswers = 0; users[k].hearts = 5; users[k].heartsLockUntil = 0;
    users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now(); scheduleCloudSync(k, true);
  }
}
function adminDeleteUser(k) {
  playTabClickSound();
  if (users[k] && confirm(`Excluir ${users[k].name}?`)) {
    users[k]._deleted = true; users[k].updatedAt = Date.now(); users[k].adminOverrideAt = Date.now(); scheduleCloudSync(k, true);
  }
}
function adminSaveMember() {
  const name = $("admNewName").value.trim().toUpperCase(), role = $("admNewRole").value;
  if (!name) return alert("Digite o nome!");
  const key = name.toLowerCase();
  users[key] = { name, role, _deleted: false, avatar: users[key]?.avatar || "🍔", password: $("admNewPass").value.trim() || "1234", xp: Math.max(0, parseInt($("admNewXp").value \vert{}\vert{} "0", 10)), correctAnswers: Math.max(0, parseInt($("admNewHits").value || "0", 10)), hearts: 5, heartsLockUntil: 0, mistakes: users[key]?.mistakes || [], lastSeen: Date.now(), updatedAt: Date.now(), adminOverrideAt: Date.now() };
  playHitSuccessSound(); scheduleCloudSync(key, true);
  $("admNewName").value = ""; $("admNewPass").value = ""; $("admNewXp").value = ""; $("admNewHits").value = "";
}

function switchMainTab(tab) {
  playTabClickSound();
  ["quiz", "book", "prizes", "admin", "updates"].forEach(t => {
    $(`tab-${t}`).classList.add("hidden");
    if ($(`nav-${t}`)) $(`nav-${t}`).className = "nav-btn flex flex-col items-center py-1.5 rounded-2xl font-bold text-[10px]";
  });
  $(`tab-${tab}`).classList.remove("hidden");
  if ($(`nav-${tab}`)) $(`nav-${tab}`).className = "nav-btn active-nav flex flex-col items-center py-1.5 rounded-2xl text-[10px]";
  if (tab === "prizes" || tab === "admin") fetchCloudHistorySafe(false);
}

window.onload = () => {
  initTheme(); injectCountdownAndKitchenUI(); rescuePreviousLocalRegistrations();
  renderAvatarSelector(); syncActiveUserHeartsState(); loadNextQuizQuestion();
  loadRandomFlashcard(); renderBookList(); refreshUIIfNeeded();
  if (currentUserKey && users[currentUserKey] && !users[currentUserKey]._deleted) {
    $("authModal").classList.add("hidden"); updateHeaderUI();
  }
  initClusterSync(); startHeartbeat(); fetchCloudHistorySafe(true);
};
