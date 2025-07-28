const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { cache } = require('../config/redis');
const chatValidators = require('../validators/chat');
const { createNotification } = require('../services/notification/notificationService');
const { upload } = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// ===== CONVERSAS =====

// @route   GET /api/chat/conversations
// @desc    Listar conversas do usuário
// @access  Private
router.get('/conversations', authenticateToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    participants: {
      some: { userId }
    },
    ...(status && { status }),
    ...(search && {
      OR: [
        {
          participants: {
            some: {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } }
                ]
              }
            }
          }
        },
        {
          messages: {
            some: {
              content: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ]
    })
  };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isOnline: true,
                lastSeen: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            attachments: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                readBy: {
                  none: { userId }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ],
      skip,
      take: parseInt(limit)
    }),

    prisma.conversation.count({ where })
  ]);

  // Formatar conversas
  const formattedConversations = conversations.map(conv => {
    const otherParticipant = conv.participants.find(p => p.userId !== userId);
    const lastMessage = conv.messages[0];
    const unreadCount = conv._count.messages;

    return {
      id: conv.id,
      type: conv.type,
      title: conv.title || `${otherParticipant?.user.firstName} ${otherParticipant?.user.lastName}`,
      avatar: conv.avatar || otherParticipant?.user.avatar,
      lastMessage: lastMessage ? {
        id: lastMessage.id,
        content: lastMessage.content,
        type: lastMessage.type,
        senderId: lastMessage.senderId,
        senderName: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
        createdAt: lastMessage.createdAt,
        hasAttachments: lastMessage.attachments.length > 0
      } : null,
      unreadCount,
      isOnline: otherParticipant?.user.isOnline || false,
      lastSeen: otherParticipant?.user.lastSeen,
      isPinned: conv.isPinned,
      isMuted: conv.participants.find(p => p.userId === userId)?.isMuted || false,
      updatedAt: conv.updatedAt
    };
  });

  res.json({
    success: true,
    data: {
      conversations: formattedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   POST /api/chat/conversations
// @desc    Criar nova conversa
// @access  Private
router.post('/conversations', authenticateToken, chatValidators.validateConversationCreation, asyncHandler(async (req, res) => {
  const { participantIds, type = 'DIRECT', title, bookingId } = req.body;
  const userId = req.user.id;

  // Verificar se é conversa direta e já existe
  if (type === 'DIRECT' && participantIds.length === 1) {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        type: 'DIRECT',
        participants: {
          every: {
            userId: { in: [userId, participantIds[0]] }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return res.json({
        success: true,
        message: 'Conversa já existe',
        data: { conversation: existingConversation }
      });
    }
  }

  // Criar conversa
  const conversation = await prisma.conversation.create({
    data: {
      type,
      title,
      bookingId,
      participants: {
        create: [
          { userId, role: 'ADMIN' },
          ...participantIds.map(id => ({ userId: id, role: 'MEMBER' }))
        ]
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true
            }
          }
        }
      }
    }
  });

  // Notificar participantes
  await Promise.all(
    participantIds.map(participantId =>
      createNotification({
        userId: participantId,
        type: 'NEW_CONVERSATION',
        title: 'Nova Conversa',
        message: `${req.user.firstName} iniciou uma conversa com você`,
        data: { conversationId: conversation.id }
      })
    )
  );

  res.status(201).json({
    success: true,
    message: 'Conversa criada com sucesso',
    data: { conversation }
  });
}));

// @route   GET /api/chat/conversations/:id
// @desc    Obter detalhes da conversa
// @access  Private
router.get('/conversations/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeen: true
            }
          }
        }
      },
      booking: {
        include: {
          service: { select: { name: true } },
          professional: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        }
      }
    }
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  res.json({
    success: true,
    data: { conversation }
  });
}));

// ===== MENSAGENS =====

// @route   GET /api/chat/conversations/:id/messages
// @desc    Listar mensagens da conversa
// @access  Private
router.get('/conversations/:id/messages', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50, before } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Verificar se usuário participa da conversa
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId }
      }
    }
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  const where = {
    conversationId: id,
    ...(before && {
      createdAt: { lt: new Date(before) }
    })
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        attachments: true,
        readBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),

    prisma.message.count({ where })
  ]);

  // Marcar mensagens como lidas
  await markMessagesAsRead(id, userId);

  res.json({
    success: true,
    data: {
      messages: messages.reverse(), // Reverter para ordem cronológica
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: total > skip + parseInt(limit)
      }
    }
  });
}));

// @route   POST /api/chat/conversations/:id/messages
// @desc    Enviar mensagem
// @access  Private
router.post('/conversations/:id/messages', authenticateToken, upload.array('attachments', 5), chatValidators.validateMessageCreation, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, type = 'TEXT', replyToId, metadata } = req.body;
  const userId = req.user.id;
  const files = req.files || [];

  // Verificar se usuário participa da conversa
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  // Processar anexos
  const attachments = files.map(file => ({
    filename: file.originalname,
    url: file.path,
    size: file.size,
    mimeType: file.mimetype,
    type: getAttachmentType(file.mimetype)
  }));

  // Criar mensagem
  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content,
      type,
      replyToId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      attachments: {
        create: attachments
      }
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      },
      attachments: true,
      replyTo: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  });

  // Atualizar conversa
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  // Marcar como lida pelo remetente
  await prisma.messageRead.create({
    data: {
      messageId: message.id,
      userId,
      readAt: new Date()
    }
  });

  // Notificar outros participantes via Socket.IO
  const otherParticipants = conversation.participants.filter(p => p.userId !== userId);
  
  // Emitir via Socket.IO (será implementado no socket service)
  req.io?.to(id).emit('new_message', {
    message,
    conversationId: id
  });

  // Criar notificações push
  await Promise.all(
    otherParticipants.map(participant =>
      createNotification({
        userId: participant.userId,
        type: 'NEW_MESSAGE',
        title: `${message.sender.firstName} ${message.sender.lastName}`,
        message: type === 'TEXT' ? content : `Enviou ${getAttachmentDescription(type)}`,
        data: { 
          conversationId: id,
          messageId: message.id 
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    message: 'Mensagem enviada com sucesso',
    data: { message }
  });
}));

// @route   PUT /api/chat/messages/:id
// @desc    Editar mensagem
// @access  Private
router.put('/messages/:id', authenticateToken, chatValidators.validateMessageUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  const message = await prisma.message.findFirst({
    where: {
      id,
      senderId: userId,
      type: 'TEXT' // Só permite editar mensagens de texto
    }
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada ou não pode ser editada', 404);
  }

  // Verificar se mensagem não é muito antiga (15 minutos)
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    throw new AppError('Mensagem muito antiga para ser editada', 400);
  }

  const updatedMessage = await prisma.message.update({
    where: { id },
    data: {
      content,
      isEdited: true,
      editedAt: new Date()
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true
        }
      },
      attachments: true
    }
  });

  // Emitir via Socket.IO
  req.io?.to(message.conversationId).emit('message_edited', {
    message: updatedMessage
  });

  res.json({
    success: true,
    message: 'Mensagem editada com sucesso',
    data: { message: updatedMessage }
  });
}));

// @route   DELETE /api/chat/messages/:id
// @desc    Deletar mensagem
// @access  Private
router.delete('/messages/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deleteForEveryone = false } = req.body;
  const userId = req.user.id;

  const message = await prisma.message.findFirst({
    where: {
      id,
      senderId: userId
    }
  });

  if (!message) {
    throw new AppError('Mensagem não encontrada', 404);
  }

  if (deleteForEveryone) {
    // Deletar para todos (só até 1 hora após envio)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (message.createdAt < oneHourAgo) {
      throw new AppError('Mensagem muito antiga para ser deletada para todos', 400);
    }

    await prisma.message.update({
      where: { id },
      data: {
        content: 'Esta mensagem foi deletada',
        type: 'DELETED',
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    // Emitir via Socket.IO
    req.io?.to(message.conversationId).emit('message_deleted', {
      messageId: id,
      deletedForEveryone: true
    });
  } else {
    // Deletar só para o usuário
    await prisma.messageDelete.create({
      data: {
        messageId: id,
        userId,
        deletedAt: new Date()
      }
    });
  }

  res.json({
    success: true,
    message: 'Mensagem deletada com sucesso'
  });
}));

// ===== FUNCIONALIDADES AVANÇADAS =====

// @route   POST /api/chat/conversations/:id/typing
// @desc    Indicar que está digitando
// @access  Private
router.post('/conversations/:id/typing', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isTyping = true } = req.body;
  const userId = req.user.id;

  // Verificar se usuário participa da conversa
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId }
      }
    }
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  // Emitir via Socket.IO
  req.io?.to(id).emit('typing_indicator', {
    userId,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    isTyping
  });

  // Salvar no Redis com TTL de 10 segundos
  const key = `typing:${id}:${userId}`;
  if (isTyping) {
    await cache.setex(key, 10, JSON.stringify({
      userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      timestamp: new Date()
    }));
  } else {
    await cache.del(key);
  }

  res.json({
    success: true,
    message: 'Status de digitação atualizado'
  });
}));

// @route   POST /api/chat/conversations/:id/pin
// @desc    Fixar/desfixar conversa
// @access  Private
router.post('/conversations/:id/pin', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;
  const userId = req.user.id;

  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId: id,
      userId
    }
  });

  if (!participant) {
    throw new AppError('Conversa não encontrada', 404);
  }

  await prisma.conversation.update({
    where: { id },
    data: { isPinned }
  });

  res.json({
    success: true,
    message: isPinned ? 'Conversa fixada' : 'Conversa desfixada'
  });
}));

// @route   POST /api/chat/conversations/:id/mute
// @desc    Silenciar/dessilenciar conversa
// @access  Private
router.post('/conversations/:id/mute', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isMuted, muteUntil } = req.body;
  const userId = req.user.id;

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId
    },
    data: {
      isMuted,
      muteUntil: muteUntil ? new Date(muteUntil) : null
    }
  });

  res.json({
    success: true,
    message: isMuted ? 'Conversa silenciada' : 'Conversa dessilenciada'
  });
}));

// @route   GET /api/chat/conversations/:id/media
// @desc    Listar mídia da conversa
// @access  Private
router.get('/conversations/:id/media', authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Verificar se usuário participa da conversa
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      participants: {
        some: { userId }
      }
    }
  });

  if (!conversation) {
    throw new AppError('Conversa não encontrada', 404);
  }

  const where = {
    message: {
      conversationId: id
    },
    ...(type && { type })
  };

  const [attachments, total] = await Promise.all([
    prisma.messageAttachment.findMany({
      where,
      include: {
        message: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),

    prisma.messageAttachment.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      attachments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// @route   GET /api/chat/search
// @desc    Buscar mensagens
// @access  Private
router.get('/search', authenticateToken, chatValidators.validateMessageSearch, asyncHandler(async (req, res) => {
  const { query, conversationId, type, page = 1, limit = 20 } = req.query;
  const userId = req.user.id;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    conversation: {
      participants: {
        some: { userId }
      }
    },
    content: {
      contains: query,
      mode: 'insensitive'
    },
    ...(conversationId && { conversationId }),
    ...(type && { type })
  };

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        conversation: {
          select: {
            id: true,
            title: true,
            type: true
          }
        },
        attachments: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit)
    }),

    prisma.message.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// ===== FUNÇÕES AUXILIARES =====

// Marcar mensagens como lidas
async function markMessagesAsRead(conversationId, userId) {
  const unreadMessages = await prisma.message.findMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readBy: {
        none: { userId }
      }
    },
    select: { id: true }
  });

  if (unreadMessages.length > 0) {
    await prisma.messageRead.createMany({
      data: unreadMessages.map(msg => ({
        messageId: msg.id,
        userId,
        readAt: new Date()
      })),
      skipDuplicates: true
    });
  }
}

// Determinar tipo de anexo
function getAttachmentType(mimeType) {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('pdf')) return 'DOCUMENT';
  if (mimeType.includes('word') || mimeType.includes('text')) return 'DOCUMENT';
  return 'FILE';
}

// Obter descrição do anexo
function getAttachmentDescription(type) {
  const descriptions = {
    IMAGE: 'uma imagem',
    VIDEO: 'um vídeo',
    AUDIO: 'um áudio',
    DOCUMENT: 'um documento',
    FILE: 'um arquivo'
  };
  return descriptions[type] || 'um anexo';
}

module.exports = router;

