/* Venture 9.4.1 — fichas oficiais de avaliação prática presencial.
   Os critérios principais têm checkbox. Os pontos de atenção são texto de referência,
   nunca opções marcáveis. Registros antigos de quatro critérios continuam válidos. */
const PRACTICAL_STATIONS_V94 = [
  {id:"chapa",icon:"🔥",badgeImage:"assets/allstar-selos/espatula.webp",label:"Chapas"},
  {id:"linha",icon:"🍔",badgeImage:"assets/allstar-selos/bigmac-box.webp",label:"Linha"},
  {id:"fritura",icon:"🍗",badgeImage:"assets/allstar-selos/batata.webp",label:"Produtos Fritos",legacyOnly:true},
  {id:"batatas",icon:"🍟",badgeImage:"assets/allstar-selos/batata.webp",label:"McFritas"},
  {id:"balcao",icon:"🥤",badgeImage:"assets/allstar-selos/bebida.webp",label:"Bebidas e Sobremesas"},
  {id:"drive",icon:"🚗",badgeImage:"assets/allstar-selos/carro.webp",label:"Drive-Thru · Montar e Apresentar"},
  {id:"drive-vendas",icon:"🚗",badgeImage:"assets/allstar-selos/carro.webp",label:"Drive-Thru · Vendas e Pagamento"},
  {id:"delivery",icon:"🛵",badgeImage:"assets/allstar-selos/caixa.webp",label:"McDelivery"},
  {id:"lope",icon:"🧽",badgeImage:"assets/allstar-selos/caixa.webp",label:"Apoio e Preparação LOPE"}
];
const PRACTICAL_COMMON_V94 = {
  ready:[
    "Não estava preparado para trabalhar na área (higiene, uniforme etc.).",
    "A área de trabalho não estava pronta (abastecimento, limpeza, equipamento, segurança).",
    "Tanto o funcionário quanto a área de trabalho não estavam prontos."
  ],
  cleanSafe:[
    "A área de trabalho não é mantida limpa.",
    "A área de trabalho não é mantida segura.",
    "A área de trabalho não é mantida limpa nem segura."
  ],
  attitude:[
    "Não tem uma atitude positiva durante o turno.",
    "Não é amável com os outros.",
    "Não tem uma atitude positiva e amável durante o turno."
  ],
  team:[
    "Não demonstra uma comunicação efetiva durante o turno.",
    "Não demonstra uma cooperação efetiva com os outros durante o turno.",
    "Não demonstra uma coordenação efetiva com os outros durante o turno."
  ],
  team4:[
    "Não demonstra uma comunicação efetiva durante o turno.",
    "Não demonstra uma cooperação efetiva com os outros durante o turno.",
    "Não demonstra uma coordenação efetiva com os outros durante o turno.",
    "Não demonstra uma comunicação, coordenação ou cooperação efetiva durante o turno."
  ],
  teamShow3:[
    "Não mostra uma comunicação efetiva durante o turno.",
    "Não mostra uma cooperação efetiva com os outros durante o turno.",
    "Não mostra uma coordenação efetiva com os outros durante o turno."
  ],
  teamShow4:[
    "Não mostra uma comunicação efetiva durante o turno.",
    "Não mostra uma cooperação efetiva com os outros durante o turno.",
    "Não mostra uma coordenação efetiva com os outros durante o turno.",
    "Não mostra uma comunicação, coordenação ou cooperação efetiva durante o turno."
  ],
  expectations:[
    "Não explica as expectativas dos clientes.",
    "Não explica como pode influenciar na experiência do cliente na sua área de trabalho.",
    "Não explica as expectativas nem como pode influenciar na experiência do cliente."
  ],
  foodSafety:[
    "Os procedimentos de segurança do alimento (lavagem das mãos, panos, prazos de validade etc.) não são seguidos.",
    "Os procedimentos de segurança (limpeza, derramamentos etc.) não são seguidos.",
    "Os procedimentos de higiene e segurança do alimento não são seguidos."
  ],
  equipment:[
    "Falta equipamento ou o equipamento está indisponível.",
    "O equipamento não está preparado, está incorreto ou indisponível.",
    "Os ajustes do equipamento estão incorretos."
  ]
};
function practicalCriterionV94(text,failures){return {text:text,failures:Array.isArray(failures)?failures:[]};}
const PRACTICAL_CHECKLISTS_V94 = [
  {
    id:"lope",stationId:"lope",label:"Apoio e Preparação LOPE",icon:"🧽",
    criteria:[
      practicalCriterionV94("Comprova que não há produtos com o prazo de armazenamento vencido e que se aplica o método PEPS (Primeiro que entrar, primeiro a sair) o tempo todo.",[
        "Não se cumprem as datas de vencimento dos prazos de armazenamento.",
        "Não se emprega o método PEPS (Primeiro que entrar, primeiro a sair).",
        "Não se cumprem as datas de vencimento dos prazos de armazenamento nem o método PEPS."
      ]),
      practicalCriterionV94("Pode explicar o que os clientes esperam de sua comida e como isso influencia em seu cozimento e preparação.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Cumpre todos os procedimentos relacionados com os alimentos, higiene e segurança.",PRACTICAL_COMMON_V94.foodSafety),
      practicalCriterionV94("São utilizadas as tabelas de níveis e estocagem para garantir o cozimento e o descongelamento da quantidade correta dos produtos.",[
        "Os níveis não são seguidos conforme a demanda.",
        "Não se realiza corretamente o cozimento dos produtos.",
        "Os produtos não são descongelados corretamente.",
        "Os níveis não são seguidos, não se descongela e nem se realiza corretamente o cozimento dos produtos."
      ]),
      practicalCriterionV94("Todos os produtos têm um tempo de vida secundário e são descartados uma vez finalizado o prazo.",[
        "O tempo de vida secundário não é marcado ou não é seguido.",
        "Os produtos não são descartados uma vez vencido o prazo de vida secundário.",
        "Os produtos não são fechados ou descartados corretamente."
      ]),
      practicalCriterionV94("As áreas de abastecimento estão limpas e trancadas (fechadas com chave).",[
        "As áreas de abastecimento não são mantidas limpas nem organizadas.",
        "As áreas de abastecimento não são mantidas trancadas.",
        "As áreas de abastecimento não são mantidas limpas, organizadas e trancadas."
      ]),
      practicalCriterionV94("Os procedimentos de cozimento e descongelamento estão corretos.",[
        "Os procedimentos de cozimento não são seguidos.",
        "Os procedimentos para o descongelamento não são seguidos.",
        "Os procedimentos de cozimento e descongelamento não são seguidos."
      ]),
      practicalCriterionV94("A área se mantém limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("O equipamento (por exemplo, os utensílios) está limpo e em bom estado.",[
        "O equipamento não é limpo corretamente seguindo o método de limpeza de quatro passos.",
        "A limpeza do equipamento não é regular, conforme os procedimentos.",
        "O equipamento não é limpo corretamente ou regularmente, conforme os procedimentos."
      ]),
      practicalCriterionV94("O funcionário mantém uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("O funcionário mostra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.teamShow4),
      practicalCriterionV94("Comprova que tanto ele quanto a área de trabalho e os equipamentos estão totalmente preparados antes de começar.",PRACTICAL_COMMON_V94.ready)
    ]
  },
  {
    id:"linha",stationId:"linha",label:"Verificação Linha",icon:"🍔",
    criteria:[
      practicalCriterionV94("Comprova que tanto o funcionário quanto a área de trabalho e o equipamento estão totalmente preparados antes de começar.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Cumpre todos os procedimentos relacionados com os produtos, a higiene e a segurança durante o turno.",PRACTICAL_COMMON_V94.foodSafety),
      practicalCriterionV94("Pode explicar o que esperam os clientes de nossos produtos e como isso influencia na sua experiência como cliente.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Inicia o produto corretamente.",[
        "Não responde ao tempo de reação do pedido que aparece na tela.",
        "Não inicia o produto corretamente."
      ]),
      practicalCriterionV94("Condimenta e prepara os produtos principais com a qualidade do Padrão Ouro de Qualidade (Gold Standard).",[
        "Não prepara o produto corretamente ao colocar os ingredientes.",
        "O produto não cumpre o Padrão Ouro de Qualidade.",
        "O produto não é preparado corretamente e não atinge a qualidade do Padrão Ouro de Qualidade (Gold Standard)."
      ]),
      practicalCriterionV94("Prepara os produtos conforme os princípios e procedimentos de condimentação (dois ao mesmo tempo).",[
        "Não segue os procedimentos de condimentação.",
        "Prepara mais de dois produtos ao mesmo tempo."
      ]),
      practicalCriterionV94("Os princípios de utilização da UHC e os tempos de vida são cumpridos.",[
        "Os princípios de utilização da UHC não são cumpridos.",
        "Os tempos de vida dos produtos não são cumpridos.",
        "Os princípios de utilização e os tempos de vida dos produtos na UHC não são cumpridos."
      ]),
      practicalCriterionV94("A área é mantida limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("O funcionário mantém uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("Mostra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.teamShow3)
    ]
  },
  {
    id:"mcfritas",stationId:"batatas",label:"Verificação McFritas",icon:"🍟",
    criteria:[
      practicalCriterionV94("Cumpre todos os procedimentos relacionados com o produto, a higiene e a segurança.",[
        "Os procedimentos de segurança do alimento (lavagem das mãos, panos etc.) não são cumpridos.",
        "Os procedimentos de segurança (limpeza, óleo quente etc.) não são cumpridos.",
        "Os procedimentos de higiene e de segurança do alimento não são cumpridos."
      ]),
      practicalCriterionV94("Cumpre corretamente os procedimentos de armazenamento e cozimento das McFritas.",[
        "Os procedimentos de armazenamento das McFritas não são cumpridos corretamente.",
        "Os procedimentos de cozimento das McFritas não são cumpridos.",
        "Os procedimentos para armazenar e cozinhar as McFritas não são cumpridos."
      ]),
      practicalCriterionV94("Cumpre corretamente os procedimentos para salgar e ensacar as McFritas.",[
        "Os procedimentos para salgar corretamente as McFritas não são seguidos.",
        "Os procedimentos para ensacá-las corretamente não são seguidos.",
        "Os procedimentos para salgar e ensacar corretamente as McFritas não são seguidos."
      ]),
      practicalCriterionV94("Produz sempre McFritas que cumprem os padrões ouro de qualidade, conforme os níveis estabelecidos.",[
        "Nem sempre se oferece qualidade, conforme o Padrão Ouro de Qualidade (Gold Standard).",
        "As McFritas não são preparadas de acordo com os níveis estabelecidos."
      ]),
      practicalCriterionV94("A área das McFritas e seu entorno são mantidos limpos e seguros.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("O funcionário mantém uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("O funcionário demonstra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.team),
      practicalCriterionV94("Comprova que tanto ele quanto a área de trabalho estão totalmente preparados.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Comprova que os ajustes de equipamento estão corretos e prontos para serem utilizados.",[
        "A temperatura do equipamento ou os ajustes para o produto não estão corretos.",
        "Falta equipamento ou o equipamento está indisponível.",
        "O equipamento não está preparado, está incorreto ou indisponível."
      ]),
      practicalCriterionV94("Pode explicar quais são as expectativas dos clientes a respeito das McFritas e como isso reflete na experiência do cliente.",PRACTICAL_COMMON_V94.expectations)
    ]
  },
  {
    id:"chapas",stationId:"chapa",label:"Verificação Chapas",icon:"🔥",
    criteria:[
      practicalCriterionV94("Mostra comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.teamShow4),
      practicalCriterionV94("Comprova que tanto ele quanto a área de trabalho e o equipamento estão totalmente preparados antes de começar.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Mostra como comprovar o tempo de cozimento e os ajustes antes de começar a preparar o produto.",[
        "Não mostra como realizar as verificações corretamente.",
        "A temperatura do equipamento está incorreta.",
        "O equipamento não está preparado, está incorreto e indisponível.",
        "Os ajustes do equipamento estão incorretos."
      ]),
      practicalCriterionV94("Pode explicar o que esperam os clientes de nossos produtos feitos na chapa e como isso pode influenciar na forma de preparar os alimentos na chapa.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Cozinha os hambúrgueres normalmente seguindo os procedimentos e cumprindo as normas de segurança e qualidade do produto.",[
        "As normas de segurança do alimento não são cumpridas.",
        "A qualidade não é cumprida conforme o Padrão Ouro de Qualidade.",
        "As normas de segurança do alimento e a qualidade conforme o Padrão Ouro de Qualidade (Gold Standard) não são seguidas."
      ]),
      practicalCriterionV94("Cozinha os hambúrgueres de 10:1 segundo os procedimentos e cumprindo as normas de segurança e qualidade do alimento.",[
        "As normas de segurança do alimento não são cumpridas.",
        "A qualidade conforme o Padrão Ouro de Qualidade não é cumprida.",
        "As normas de segurança do alimento e a qualidade conforme o Padrão Ouro de Qualidade (Gold Standard) não são cumpridas."
      ]),
      practicalCriterionV94("Elabora os produtos conforme a e-production (PLS) e segue o nível estabelecido.",[
        "O e-production (PLS) não é utilizado corretamente.",
        "Os níveis estabelecidos não são seguidos."
      ]),
      practicalCriterionV94("As chapas são limpas corretamente em cada rodada e estão em bom estado.",[
        "As chapas não são limpas corretamente em cada rodada.",
        "As chapas não estão em bom estado."
      ]),
      practicalCriterionV94("Os princípios de utilização da UHC e os tempos de vida dos produtos são seguidos.",[
        "Os princípios de utilização da UHC não são seguidos.",
        "Os tempos de vida na UHC não são seguidos.",
        "Os princípios de utilização e os tempos de vida do produto na UHC não são seguidos."
      ]),
      practicalCriterionV94("A área é mantida limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("Durante o turno são seguidos os procedimentos de segurança do alimento.",[
        "Os procedimentos de segurança do alimento (lavagem das mãos, panos etc.) não são seguidos.",
        "Os procedimentos de segurança do alimento (cozimento da carne, tempos de vida etc.) não são seguidos."
      ]),
      practicalCriterionV94("O funcionário mantém uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude)
    ]
  },
  {
    id:"bebidas",stationId:"balcao",label:"Verificação Bebidas e Sobremesas",icon:"🥤",
    criteria:[
      practicalCriterionV94("Comprova que tanto o funcionário quanto o equipamento estão abastecidos e prontos para começar.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Pode explicar o que esperam os clientes de nossas bebidas e sobremesas e como isso pode influenciar na experiência do cliente.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Responde adequadamente aos pedidos do sistema KVS.",[
        "Não responde corretamente aos pedidos do sistema KVS.",
        "Não serve corretamente os pedidos dos clientes.",
        "Não responde corretamente aos pedidos do sistema KVS e os pedidos não são servidos corretamente."
      ]),
      practicalCriterionV94("As bebidas são preparadas conforme o Padrão Ouro de Qualidade (Gold Standard) e são servidas corretamente.",[
        "Nem sempre se oferece a qualidade conforme o Padrão Ouro.",
        "As bebidas não são preparadas de acordo com a demanda dos clientes.",
        "O Padrão Ouro de Qualidade não é cumprido segundo o processo e as bebidas não são servidas corretamente."
      ]),
      practicalCriterionV94("As bebidas quentes são preparadas conforme o Padrão Ouro de Qualidade (Gold Standard) e são servidas corretamente.",[
        "Nem sempre se oferece qualidade conforme o Padrão Ouro (Gold Standard).",
        "As bebidas não são preparadas conforme a demanda dos clientes.",
        "O Padrão Ouro de Qualidade não é cumprido seguindo o processo."
      ]),
      practicalCriterionV94("Os Milk Shakes são preparados conforme o Padrão Ouro de Qualidade (Gold Standard) e são servidos corretamente.",[
        "Nem sempre se oferece qualidade conforme o Padrão Ouro (Gold Standard).",
        "Os Milk Shakes não são preparados conforme a demanda dos clientes.",
        "O Padrão Ouro de Qualidade não é cumprido seguindo o processo."
      ]),
      practicalCriterionV94("As sobremesas de sorvete são preparadas conforme o Padrão Ouro (Gold Standard) e são servidas corretamente.",[
        "Nem sempre se oferece qualidade conforme o Padrão Ouro (Gold Standard).",
        "Os sorvetes não são preparados conforme a demanda dos clientes.",
        "O Padrão Ouro de Qualidade não é cumprido segundo o processo."
      ]),
      practicalCriterionV94("Durante o turno são cumpridos os procedimentos de segurança do alimento.",[
        "Os procedimentos de segurança do alimento (lavagem das mãos, panos etc.) não são seguidos.",
        "Os procedimentos de segurança do alimento (datas de validade, luvas etc.) não são seguidos."
      ]),
      practicalCriterionV94("A área de trabalho é mantida limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("É mantida uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("Demonstra comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.team4)
    ]
  },
  {
    id:"drive-montar",stationId:"drive",label:"Verificação Drive-Thru — Montar e Apresentar",icon:"🚗",
    criteria:[
      practicalCriterionV94("Demonstra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.team4),
      practicalCriterionV94("Verifica se o funcionário e a área de trabalho estão completamente preparados antes de começar.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Todo o material necessário está disponível e organizado corretamente.",PRACTICAL_COMMON_V94.equipment),
      practicalCriterionV94("Pode explicar o que esperam os clientes de sua visita ao Drive-Thru do McDonald's e como isso influencia em sua experiência.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Cumprimenta todos os clientes para criar uma boa impressão.",["O cliente não é cumprimentado corretamente."]),
      practicalCriterionV94("Cumpre todos os procedimentos de preparação dos produtos para fornecer ao cliente uma excelente experiência.",["Os pedidos não são preparados corretamente."]),
      practicalCriterionV94("Cumpre todos os procedimentos de entrega para fornecer uma excelente experiência ao cliente.",[
        "O cliente não é novamente cumprimentado.",
        "Os pedidos não são entregues corretamente.",
        "O cliente não é novamente cumprimentado e os pedidos não são entregues corretamente."
      ]),
      practicalCriterionV94("Revisa cada pedido para verificar se está correto antes de entregá-lo.",["Os pedidos não são duplamente checados antes de sua entrega."]),
      practicalCriterionV94("Conecta-se com o cliente durante o processo de tomada de pedidos, olhando nos seus olhos e empregando outras formas para que se sinta especial.",[
        "Não sorri nem estabelece contato visual.",
        "Não se conecta com o cliente.",
        "Não procura maneiras de fazer o cliente se sentir especial.",
        "Não se conecta com o cliente nem procura maneiras de fazê-lo se sentir especial."
      ]),
      practicalCriterionV94("Utiliza a janela de Fast Forward para a finalidade para a qual foi desenhada.",[
        "Não indica aos veículos que avancem quando corresponde.",
        "Não utiliza a janela Pull Forward (Avançar)."
      ]),
      practicalCriterionV94("Indica aos motoristas dos veículos que avancem ou estacionem para que tudo flua dentro do Drive-Thru.",[
        "Não indica aos motoristas dos veículos que estacionem quando necessário.",
        "Os veículos não estacionam corretamente."
      ]),
      practicalCriterionV94("Foca-se nos clientes e garante que todas as interações proporcionem uma experiência excelente.",[
        "Não se foca nos clientes.",
        "Foca-se no processo e não oferece uma experiência excelente ao cliente.",
        "Não aproveita as oportunidades para melhorar a experiência do cliente."
      ]),
      practicalCriterionV94("A área é mantida limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("É mantida uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude)
    ]
  },
  {
    id:"drive-vendas",stationId:"drive-vendas",label:"Verificação Drive-Thru — Influenciar, Vender e Pagamento",icon:"🚗",
    criteria:[
      practicalCriterionV94("A área é mantida limpa e segura durante o turno.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("É mantida uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("Demonstra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.team),
      practicalCriterionV94("Todo o material necessário está disponível e corretamente configurado.",PRACTICAL_COMMON_V94.equipment),
      practicalCriterionV94("Pode explicar o que os clientes esperam de sua visita ao Drive-Thru e como isso influi na sua experiência.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("Cumprimenta todos os clientes colocando em prática as premissas de Cultura de Serviço.",[
        "Não cumprimenta o cliente de forma correta.",
        "Não coloca em prática as premissas de Cultura de Serviço."
      ]),
      practicalCriterionV94("Cumpre todos os procedimentos da tomada de pedidos para fornecer uma experiência excelente ao cliente.",[
        "O pedido do cliente não é tomado de forma correta.",
        "Os clientes são interrompidos.",
        "Exerce pressão sobre os clientes durante a tomada dos pedidos."
      ]),
      practicalCriterionV94("Cumpre todos os procedimentos do caixa para fornecer uma experiência excelente ao cliente.",[
        "Há uma má gestão dos pagamentos.",
        "Os pagamentos não são guardados em local seguro.",
        "Há uma má gestão dos pagamentos e eles não são guardados em local seguro."
      ]),
      practicalCriterionV94("Não exerce pressão para que os clientes façam o pedido e não os interrompe durante a tomada do pedido.",[
        "Exerce pressão sobre os clientes durante a tomada dos pedidos.",
        "Os clientes são interrompidos.",
        "Os clientes são interrompidos e há pressão para que façam o pedido."
      ]),
      practicalCriterionV94("Conecta-se com o cliente durante a tomada de pedidos, olhando nos seus olhos e fazendo com que se sinta especial.",[
        "Não se conecta com o cliente.",
        "Não procura maneiras de fazer com que o cliente se sinta especial.",
        "Não se conecta com o cliente ou não procura maneiras de fazê-lo se sentir especial."
      ]),
      practicalCriterionV94("Direciona e ajuda o cliente para que se dirija à próxima cabine de atendimento.",[
        "Não orienta os clientes a se dirigirem à próxima cabine de atendimento."
      ]),
      practicalCriterionV94("Aplicam-se todos os procedimentos de segurança pessoal e cuidado dos bens.",[
        "Não se aplicam os procedimentos de segurança pessoal.",
        "Não se aplicam os procedimentos de cuidado dos bens.",
        "Não se aplicam os procedimentos de segurança pessoal e cuidado dos bens."
      ])
    ]
  },
  {
    id:"mcdelivery",stationId:"delivery",label:"Verificação McDelivery",icon:"🛵",
    criteria:[
      practicalCriterionV94("A área é mantida limpa e segura durante todo o tempo.",PRACTICAL_COMMON_V94.cleanSafe),
      practicalCriterionV94("Os pedidos estão prontos antes da chegada do entregador.",[
        "Os pedidos não estão prontos.",
        "Os itens não estão prontos para entrega."
      ]),
      practicalCriterionV94("O funcionário mantém uma atitude positiva e amável durante o turno.",PRACTICAL_COMMON_V94.attitude),
      practicalCriterionV94("O funcionário mostra uma comunicação, cooperação e coordenação efetiva com os outros.",PRACTICAL_COMMON_V94.teamShow3),
      practicalCriterionV94("Aplicam-se todos os procedimentos de segurança do alimento e prevenção de riscos laborais.",[
        "Não se aplicam os procedimentos de segurança do alimento (lavagem das mãos, troca de panos etc.).",
        "Não se aplicam os procedimentos de segurança (limpeza, derramamentos etc.).",
        "Não se aplicam os procedimentos de higiene e segurança do alimento."
      ]),
      practicalCriterionV94("Revisa cada pedido para confirmar se está correto conforme o solicitado pelo cliente, incluindo os condimentos, antes de entregá-lo.",[
        "O pedido não é conferido para confirmar se corresponde ao pedido realizado pelo cliente.",
        "O pedido é apresentado parcialmente montado ou sem os condimentos corretos."
      ]),
      practicalCriterionV94("O funcionário conhece o que pode fazer para garantir a precisão dos pedidos.",["Não conhece como garantir a precisão dos pedidos."]),
      practicalCriterionV94("Comprova que tanto o funcionário quanto o equipamento estão prontos para trabalhar na área.",PRACTICAL_COMMON_V94.ready),
      practicalCriterionV94("Pode explicar o que esperam os clientes do McDelivery e como isso pode influenciar na experiência do cliente.",PRACTICAL_COMMON_V94.expectations),
      practicalCriterionV94("O pedido só é servido quando estiver totalmente pronto, conforme o critério: “Se não está bem, não sirva”.",[
        "Os pedidos são servidos antes de ficarem prontos.",
        "Os pedidos são servidos depois de muito tempo.",
        "Os pedidos são servidos apesar de não estarem corretos."
      ])
    ]
  }
];
const PRACTICAL_ACTIVE_STATION_COUNT_V94=PRACTICAL_STATIONS_V94.filter(function(s){return !s.legacyOnly;}).length;
function validPracticalRecord(r){
  if(!r || typeof r!=="object" || !/^P-[a-z0-9-]{6,55}$/.test(r.id||""))return false;
  const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===r.stationId;});
  if(!station || typeof r.evaluator!=="string" || r.evaluator.length<2 || r.evaluator.length>70 ||
    typeof r.notes!=="string" || r.notes.length>350 ||
    !Number.isFinite(Number(r.createdAt)) || Number(r.createdAt)<=1600000000000 ||
    !Array.isArray(r.checks) || !r.checks.every(function(x){return typeof x==="boolean";}) ||
    r.approved!==r.checks.every(Boolean))return false;
  if(r.checklistId){
    const checklist=PRACTICAL_CHECKLISTS_V94.find(function(c){return c.id===r.checklistId && c.stationId===r.stationId;});
    return Boolean(checklist && r.checks.length===checklist.criteria.length);
  }
  return r.checks.length===4;
}
function practicalRecords(user){
  const recs=user && user.practicalAssessments && user.practicalAssessments.records;
  return Object.values(recs && typeof recs==="object" && !Array.isArray(recs)?recs:{})
    .filter(validPracticalRecord).sort(function(a,b){return b.createdAt-a.createdAt;});
}
function mergePracticalAssessments(a,b){
  const records={};
  [a,b].forEach(function(src){
    const dict=src && typeof src==="object"?src.records:null;
    if(!dict || typeof dict!=="object")return;
    Object.entries(dict).forEach(function(entry){
      const id=entry[0],r=entry[1];
      if(id===r?.id && validPracticalRecord(r) && !records[id])records[id]=r;
    });
  });
  return {records:records};
}
function practicalApprovedStations(user){
  const map={};
  practicalRecords(user).forEach(function(r){if(r.approved && !map[r.stationId])map[r.stationId]=r;});
  return map;
}
function practicalBadgeMarkup(user,showLocked){
  const earned=practicalApprovedStations(user);
  return PRACTICAL_STATIONS_V94
    .filter(function(s){return !s.legacyOnly || Boolean(earned[s.id]);})
    .filter(function(s){return showLocked || earned[s.id];})
    .map(function(s){
      const record=earned[s.id],status=record?"Conquistado":"Bloqueado";
      return '<article class="practical-badge '+(record?"is-approved":"is-pending")+'" data-practical-badge="'+s.id+'">'+
        '<div class="practical-badge-art"><img src="'+s.badgeImage+'" alt="'+trainerSafeHtml(s.label)+'" loading="lazy" decoding="async">'+
        '<span class="practical-badge-lock" aria-label="'+status+'">'+(record?"✓":"🔒")+'</span></div>'+
        '<strong>'+trainerSafeHtml(s.label)+'</strong>'+
        '<small>'+(record?"🏅 Aprovado · "+premiumDate(record.createdAt):"Ainda não aprovado")+'</small></article>';
    }).join("") || '<p class="practical-empty">Nenhum selo prático conquistado ainda.</p>';
}
function practicalHistoryMarkup(user,limit){
  const records=practicalRecords(user).slice(0,limit||10);
  if(!records.length)return '<p class="trainer-help">Nenhuma avaliação registrada para este colaborador.</p>';
  return records.map(function(r){
    const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===r.stationId;});
    const checklist=r.checklistId && PRACTICAL_CHECKLISTS_V94.find(function(c){return c.id===r.checklistId;});
    const label=checklist?checklist.label:(station?station.label:"Estação");
    const total=r.checks.length,done=r.checks.filter(Boolean).length;
    const pending=checklist?checklist.criteria.filter(function(c,i){return !r.checks[i];}).map(function(c){return c.text;}):[];
    return '<article class="practical-history-entry"><div class="practical-entry-top"><strong><img class="practical-history-icon" src="'+(station?station.badgeImage:"")+'" alt="" loading="lazy"> '+trainerSafeHtml(label)+'</strong>'+
      '<span class="'+(r.approved?"practical-pass":"practical-retry")+'">'+(r.approved?"✅ Aprovado":"📚 Em desenvolvimento")+'</span></div>'+
      '<small>'+premiumDate(r.createdAt)+' · Avaliador: '+trainerSafeHtml(r.evaluator)+' · '+done+'/'+total+' critérios</small>'+
      (pending.length?'<div class="practical-history-gaps"><strong>Pontos a desenvolver:</strong><ul>'+pending.map(function(t){return "<li>"+trainerSafeHtml(t)+"</li>";}).join("")+'</ul></div>':"")+
      (r.notes?'<p>'+trainerSafeHtml(r.notes)+'</p>':"")+'</article>';
  }).join("");
}
function renderPracticalInProfiles(user,publicView){
  if(!user)return;
  const earned=practicalApprovedStations(user);
  const count=PRACTICAL_STATIONS_V94.filter(function(s){return !s.legacyOnly && earned[s.id];}).length;
  if(publicView){
    const summary=$("publicPracticalSummary");if(summary)summary.textContent=count+"/"+PRACTICAL_ACTIVE_STATION_COUNT_V94+" estações";
    const badges=$("publicPracticalBadges");if(badges)badges.innerHTML=practicalBadgeMarkup(user,false);
  }else{
    const summary=$("premiumPracticalSummary");if(summary)summary.textContent=count+" de "+PRACTICAL_ACTIVE_STATION_COUNT_V94+" avaliações aprovadas · selos concedidos após avaliação presencial.";
    const badges=$("premiumPracticalBadges");if(badges)badges.innerHTML=practicalBadgeMarkup(user,true);
    const history=$("premiumPracticalHistory");if(history)history.innerHTML=practicalHistoryMarkup(user,8);
  }
}
function renderPracticalTrainerRoster(){
  const sel=$("practicalStaffSelect");if(!isTrainerUnlocked || !sel)return;
  const old=sel.value;
  const list=Object.entries(users).filter(function(entry){return entry[1] && entry[1].name && !entry[1]._deleted;})
    .sort(function(a,b){return a[1].name.localeCompare(b[1].name,"pt-BR");});
  sel.replaceChildren(new Option("Escolha um colaborador...",""));
  list.forEach(function(entry){sel.add(new Option(entry[1].name+" · "+(entry[1].role||"Colaborador"),entry[0]));});
  if(list.some(function(entry){return entry[0]===old;}))sel.value=old;
  renderPracticalTrainerHistory();
}
function renderPracticalChecklist(){
  const sel=$("practicalStationSelect"),holder=$("practicalChecklist");
  if(!sel || !holder)return;
  if(!sel.options.length)PRACTICAL_CHECKLISTS_V94.forEach(function(c){
    const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===c.stationId;});
    sel.add(new Option((station?station.icon:c.icon)+" "+c.label,c.id));
  });
  let checklist=PRACTICAL_CHECKLISTS_V94.find(function(c){return c.id===sel.value;})||PRACTICAL_CHECKLISTS_V94[0];
  if(!checklist)return;
  if(sel.value!==checklist.id)sel.value=checklist.id;
  const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===checklist.stationId;});
  const preview=$("practicalStationPreview");
  if(preview && station){
    preview.innerHTML='<div class="practical-station-preview-art"><img src="'+station.badgeImage+'" alt="" loading="lazy"></div>'+
      '<div><span>SELO DA AVALIAÇÃO</span><strong>'+trainerSafeHtml(checklist.label)+'</strong><small>'+checklist.criteria.length+' critérios de verificação. O selo é concedido somente quando todos forem atendidos e a avaliação for registrada.</small></div>';
    preview.classList.remove("is-ready");
  }
  holder.replaceChildren();
  checklist.criteria.forEach(function(item,i){
    const card=document.createElement("article");card.className="practical-criterion-card";
    const label=document.createElement("label");label.className="practical-check-row";
    const check=document.createElement("input");check.type="checkbox";check.name="practicalCriteria";check.value=String(i);
    check.addEventListener("change",renderPracticalResultPreview);
    const text=document.createElement("span");text.textContent=item.text;
    label.append(check,text);card.append(label);
    if(item.failures && item.failures.length){
      const reference=document.createElement("div");reference.className="practical-failures";
      const heading=document.createElement("strong");heading.textContent="Pontos de atenção — NÃO MARCAR";
      const list=document.createElement("ul");
      item.failures.forEach(function(failure){const li=document.createElement("li");li.textContent=failure;list.append(li);});
      reference.append(heading,list);card.append(reference);
    }
    holder.append(card);
  });
  renderPracticalResultPreview();
}
function renderPracticalResultPreview(){
  const list=Array.from(document.querySelectorAll("#practicalChecklist input[type=checkbox]"));
  const count=list.filter(function(x){return x.checked;}).length,total=list.length;
  const percent=total?Math.round(count/total*100):0;
  const box=$("practicalResultPreview");if(!box)return;
  box.className="practical-result "+(total>0 && count===total?"ready":"needs-work");
  box.textContent=total && count===total?
    "🏅 "+count+"/"+total+" critérios atendidos. Avaliação aprovada: ao registrar, o selo será concedido.":
    "📋 "+count+"/"+total+" critérios atendidos ("+percent+"%). Faltam "+(total-count)+" para aprovação.";
  const countLabel=$("practicalProgressCount");if(countLabel)countLabel.textContent=count+"/"+total;
  const fill=$("practicalProgressFill");if(fill)fill.style.width=percent+"%";
  const preview=$("practicalStationPreview");if(preview)preview.classList.toggle("is-ready",total>0 && count===total);
}
function renderPracticalTrainerHistory(){
  const box=$("trainerPracticalHistory");if(!box)return;
  const key=$("practicalStaffSelect")?.value;
  box.innerHTML=key && users[key]?practicalHistoryMarkup(users[key],12):'<p class="trainer-help">Selecione um colaborador para consultar o histórico.</p>';
}
function savePracticalAssessment(event){
  event.preventDefault();
  if(!isTrainerUnlocked)return;
  const key=$("practicalStaffSelect").value,checklistId=$("practicalStationSelect").value;
  const checklist=PRACTICAL_CHECKLISTS_V94.find(function(c){return c.id===checklistId;});
  const checks=Array.from(document.querySelectorAll("#practicalChecklist input[type=checkbox]")).map(function(el){return el.checked;});
  const evaluator=$("practicalEvaluator").value.trim(),notes=$("practicalNotes").value.trim();
  if(!Object.prototype.hasOwnProperty.call(users,key) || !users[key] || users[key]._deleted ||
    !checklist || checks.length!==checklist.criteria.length || evaluator.length<2 || evaluator.length>70 || notes.length>350){
    alert("Confira o colaborador, a ficha, os critérios e o nome do avaliador.");return;
  }
  const station=PRACTICAL_STATIONS_V94.find(function(s){return s.id===checklist.stationId;});
  if(!station)return;
  const approved=checks.every(Boolean),status=approved?"APROVADO":"EM DESENVOLVIMENTO";
  if(!confirm("Registrar "+checklist.label+" para "+users[key].name+"? Resultado: "+status+". Nenhum XP será concedido."))return;
  const now=Date.now(),id="P-"+now.toString(36)+"-"+Math.random().toString(36).slice(2,10);
  const record={id:id,stationId:checklist.stationId,checklistId:checklist.id,checks:checks,approved:approved,evaluator:evaluator,notes:notes,createdAt:now};
  if(!validPracticalRecord(record))return;
  const user=users[key];
  if(!user.practicalAssessments || typeof user.practicalAssessments!=="object")user.practicalAssessments={records:{}};
  if(!user.practicalAssessments.records)user.practicalAssessments.records={};
  user.practicalAssessments.records[id]=record;user.updatedAt=now;
  scheduleCloudSync(key,true);
  const info=$("practicalSaveFeedback");
  info.textContent=approved?"✅ Aprovado! Selo da avaliação registrado no perfil.":"📚 Registrado como Em desenvolvimento. Os critérios pendentes aparecem no histórico e podem ser reavaliados.";
  info.classList.remove("hidden");
  $("trainerPracticalForm").querySelectorAll('input[type="checkbox"]').forEach(function(x){x.checked=false;});
  $("practicalNotes").value="";
  renderPracticalResultPreview();renderPracticalTrainerHistory();renderPracticalDashboard();
  if(currentUserKey===key)renderPremiumProfile();
  if(publicProfileSelectedKey===key)renderPublicProfile();
}
