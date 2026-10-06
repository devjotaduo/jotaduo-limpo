import { type Messages } from '@lingui/core';

// The pt-BR copy is the design's, word for word. Locales missing here fall
// back to the English source message.
export const JOTADUO_CATALOGS: Record<string, Messages> = {
  'pt-BR': {
    'jotaduo.navigation.home': 'Início',
    'jotaduo.navigation.conversations': 'Conversas',
    'jotaduo.navigation.search': 'Buscar',
    'jotaduo.navigation.ai': 'IA',
    'jotaduo.navigation.mainNavigation': 'Navegação principal',
    'jotaduo.mobileHome.switchWorkspace': 'Trocar de espaço de trabalho',
    'jotaduo.mobileHome.create': 'Criar',
    'jotaduo.mobileHome.organize': 'Organizar',
    'jotaduo.mobileHome.myWork': 'Meu trabalho',
    'jotaduo.mobileHome.today': 'Hoje',
    'jotaduo.mobileHome.todayItemCountOne': '1 item',
    'jotaduo.mobileHome.todayItemCountOther': '%count% itens',
    'jotaduo.mobileHome.todayEmptyTitle': 'Nada marcado para hoje',
    'jotaduo.mobileHome.todayEmptyDescription':
      'Agendamentos, lembretes e tarefas do dia aparecem aqui.',
    'jotaduo.mobileHome.createTask': 'Criar tarefa',
    'jotaduo.mobileHome.seeDayAgenda': 'Ver agenda do dia',
    'jotaduo.mobileHome.overdueTaskCountOne': '1 tarefa atrasada',
    'jotaduo.mobileHome.overdueTaskCountOther': '%count% tarefas atrasadas',
    'jotaduo.mobileHome.completeTask': 'Concluir tarefa: %title%',
    'jotaduo.mobileHome.reopenTask': 'Reabrir tarefa: %title%',
    'jotaduo.mobileHome.greetingMorning': 'Bom dia',
    'jotaduo.mobileHome.greetingAfternoon': 'Boa tarde',
    'jotaduo.mobileHome.greetingEvening': 'Boa noite',
    'jotaduo.mobileHome.assistant': 'Assistente',
    'jotaduo.mobileHome.favoritesHint':
      'Fixe pessoas, empresas e outros registros para abrir com um toque.',
    'jotaduo.mobileHome.dayAgenda': 'Agenda do dia',
    'jotaduo.mobileHome.favorites': 'Favoritos',
    'jotaduo.mobileHome.organizeFavorites': 'Organizar Favoritos',
    'jotaduo.mobileHome.addFavorite': 'Adicionar favorito',
    'jotaduo.mobileHome.removeFavorite': 'Remover dos favoritos',
    'jotaduo.mobileHome.shortcuts': 'Atalhos',
    'jotaduo.mobileHome.organizeShortcuts': 'Organizar Atalhos',
    'jotaduo.mobileHome.removeShortcut': 'Remover dos atalhos',
    'jotaduo.mobileHome.shortcutsEmptyTitle':
      'O que você mais abre, a um toque de distância',
    'jotaduo.mobileHome.shortcutsEmptyDescription':
      'Fixe aqui as listas do dia a dia, como as conversas sem resposta, a agenda de amanhã ou as cobranças em aberto.',
    'jotaduo.mobileHome.shortcutsEmptyAction': 'Começar',
    'jotaduo.mobileHome.editMyWork': 'Editar meu trabalho',
    'jotaduo.mobileHome.showOnHome': 'Mostrar no Início',
    'jotaduo.mobileHome.done': 'Concluir',
    'jotaduo.mobileHome.add': 'Adicionar',
    'jotaduo.mobileHome.remove': 'Remover',
    'jotaduo.mobileHome.holdToReorder': 'Segure e arraste para reordenar',
    'jotaduo.mobileHome.selected': 'Selecionado',
    'jotaduo.mobileHome.selectRecords': 'Selecionar registros',
    'jotaduo.mobileHome.suggestedLists': 'Listas',
    'jotaduo.mobileHome.suggestedViews': 'Visualizações',
    'jotaduo.mobileHome.suggestedPages': 'Páginas',
    'jotaduo.mobileHome.loading': 'Carregando...',
    'jotaduo.mobileHome.noResults': 'Nenhum resultado encontrado',
    'jotaduo.onboarding.stepCount': 'Pergunta %current% de %total%',
    'jotaduo.onboarding.areaTitle': 'Qual é a área de atuação da empresa?',
    'jotaduo.onboarding.areaSubtitle':
      'A área sugere as funções e os assuntos que a atendente virtual precisa conhecer.',
    'jotaduo.onboarding.areaChangeNotice':
      'Trocar a área recomeça as funções, as fontes e os textos das próximas etapas. O que já atende os clientes continua igual até você liberar de novo.',
    'jotaduo.onboarding.companyTitle': 'Qual é o nome da empresa?',
    'jotaduo.onboarding.companySubtitle':
      'É o nome que os clientes leem nas mensagens e nas páginas. CNPJ, site e Instagram são opcionais.',
    'jotaduo.onboarding.companyName': 'Nome da empresa',
    'jotaduo.onboarding.cnpj': 'CNPJ',
    'jotaduo.onboarding.website': 'Site',
    'jotaduo.onboarding.instagram': 'Instagram',
    'jotaduo.onboarding.goalsTitle': 'Qual é o objetivo com o JotaDuo?',
    'jotaduo.onboarding.goalsSubtitle':
      'Escolha tudo o que a empresa quer resolver com o atendimento no WhatsApp.',
    'jotaduo.onboarding.goalSales': 'Vendas',
    'jotaduo.onboarding.goalService': 'Atendimento',
    'jotaduo.onboarding.goalScheduling': 'Agendamento',
    'jotaduo.onboarding.goalSupport': 'Suporte',
    'jotaduo.onboarding.goalAutomation': 'Automação',
    'jotaduo.onboarding.goalMarketing': 'Marketing',
    'jotaduo.onboarding.goalOther': 'Outros',
    'jotaduo.onboarding.systemTitle': 'Qual sistema a empresa usa hoje?',
    'jotaduo.onboarding.systemSubtitle':
      'Os mais usados na sua área estão na lista. Se o seu não estiver, escolha Outro.',
    'jotaduo.onboarding.noSystem': 'Não uso sistema',
    'jotaduo.onboarding.otherSystem': 'Outro',
    'jotaduo.onboarding.systemName': 'Nome do sistema',
    'jotaduo.onboarding.assistantTitle':
      'Como a atendente virtual vai se chamar?',
    'jotaduo.onboarding.assistantSubtitle':
      'O nome aparece para os clientes no WhatsApp. Ela só começa a responder depois que você ativar as funções.',
    'jotaduo.onboarding.assistantName': 'Nome da atendente virtual',
    'jotaduo.onboarding.companyWhatsapp': 'WhatsApp de atendimento da empresa',
    'jotaduo.onboarding.ownerWhatsapp': 'WhatsApp do responsável',
    'jotaduo.onboarding.back': 'Voltar',
    'jotaduo.onboarding.progress': 'Progresso das perguntas',
    'jotaduo.onboarding.dialogLabel': 'Configuração inicial do JotaDuo',
    'jotaduo.onboarding.setupProgress': 'Progresso da configuração da conta',
    'jotaduo.onboarding.setupStepCount': 'Etapa %current% de %total%',
    'jotaduo.onboarding.loading': 'Carregando a configuração da empresa…',
    'jotaduo.onboarding.previewGoals': 'Objetivos',
    'jotaduo.onboarding.previewSystem': 'Sistema da empresa',
    'jotaduo.onboarding.previewAssistantName': 'Nome da atendente',
    'jotaduo.onboarding.previewAssistantRole': 'Atendente virtual',
    'jotaduo.onboarding.previewCompany': 'Empresa',
    'jotaduo.onboarding.previewOwner': 'Responsável',
    'jotaduo.onboarding.continue': 'Continuar',
    'jotaduo.onboarding.finish': 'Concluir',
    'jotaduo.onboarding.changeAndSave': 'Trocar e salvar',
    'jotaduo.onboarding.close': 'Fechar',
    'jotaduo.onboarding.finished': 'Configuração inicial concluída.',
    'jotaduo.onboarding.loadErrorTitle':
      'Não foi possível carregar a configuração',
    'jotaduo.onboarding.retry': 'Tentar de novo',
    'jotaduo.onboarding.requestFailed':
      'Não foi possível acessar o JotaDuo. Tente novamente.',
    'jotaduo.onboarding.accessDenied':
      'Acesso negado. Confira sua sessão e o papel JotaDuo no Twenty.',
    'jotaduo.onboarding.errorEmptyArea':
      'Escolha a área de atuação para continuar.',
    'jotaduo.onboarding.errorEmptyGoals':
      'Escolha ao menos um objetivo para continuar.',
    'jotaduo.onboarding.errorEmptySystem':
      'Escolha o sistema, ou "Não uso sistema", para continuar.',
    'jotaduo.onboarding.errorEmptyText': 'Escreva a resposta para continuar.',
    'jotaduo.onboarding.errorEmptyPhone':
      'Informe o telefone com DDD para continuar.',
    'jotaduo.onboarding.errorSystemName':
      'Escreva o nome do sistema para continuar.',
    'jotaduo.onboarding.errorTooLong':
      'Use até %limit% caracteres (%typed% digitados).',
    'jotaduo.onboarding.errorCnpj':
      'Confira o CNPJ: são 14 números, por exemplo 12.345.678/0001-95.',
    'jotaduo.onboarding.errorPhone':
      'Informe o telefone com DDD, por exemplo 87 99999-0000.',
    'jotaduo.onboarding.errorAssistantName':
      'Use de 2 a 20 letras, sem números.',
    'jotaduo.onboarding.errorInstagram':
      'Use o @ da conta, por exemplo @suaempresa.',
    'jotaduo.onboarding.errorWebsite':
      'Confira o endereço, por exemplo https://suaempresa.com.br.',
    'jotaduo.onboarding.errorWebsiteScheme':
      'Comece com https://, por exemplo https://suaempresa.com.br.',
  },
};
