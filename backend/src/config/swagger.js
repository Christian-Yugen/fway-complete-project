const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fway Backend API',
      version: '1.0.0',
      description: 'API completa para plataforma de saúde Fway com autenticação JWT, RBAC e documentação completa',
      contact: {
        name: 'Fway Team',
        email: 'dev@fway.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desenvolvimento'
      },
      {
        url: 'https://api.fway.com',
        description: 'Servidor de produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação. Formato: Bearer {token}'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Mensagem de erro'
            },
            error: {
              type: 'string',
              example: 'Detalhes do erro'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Dados inválidos'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email é obrigatório'
                  }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cuid123456789'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com'
            },
            firstName: {
              type: 'string',
              example: 'João'
            },
            lastName: {
              type: 'string',
              example: 'Silva'
            },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'PROFESSIONAL'],
              example: 'USER'
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'],
              example: 'ACTIVE'
            },
            phone: {
              type: 'string',
              example: '+5511999999999'
            },
            avatar: {
              type: 'string',
              example: 'https://example.com/avatar.jpg'
            },
            emailVerified: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-01-01T00:00:00.000Z'
            }
          }
        },
        Professional: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cuid123456789'
            },
            userId: {
              type: 'string',
              example: 'cuid123456789'
            },
            type: {
              type: 'string',
              enum: ['DOCTOR', 'NURSE', 'PHYSIOTHERAPIST', 'PSYCHOLOGIST', 'NUTRITIONIST', 'OTHER'],
              example: 'DOCTOR'
            },
            specialization: {
              type: 'string',
              example: 'Cardiologia'
            },
            license: {
              type: 'string',
              example: 'CRM123456'
            },
            experience: {
              type: 'integer',
              example: 5
            },
            address: {
              type: 'string',
              example: 'Rua das Flores, 123'
            },
            city: {
              type: 'string',
              example: 'São Paulo'
            },
            state: {
              type: 'string',
              example: 'SP'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            isVerified: {
              type: 'boolean',
              example: true
            },
            consultationFee: {
              type: 'number',
              format: 'float',
              example: 150.00
            }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'cuid123456789'
            },
            userId: {
              type: 'string',
              example: 'cuid123456789'
            },
            professionalId: {
              type: 'string',
              example: 'cuid123456789'
            },
            serviceId: {
              type: 'string',
              example: 'cuid123456789'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-12-01T10:00:00.000Z'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
              example: 'CONFIRMED'
            },
            price: {
              type: 'number',
              format: 'float',
              example: 150.00
            },
            notes: {
              type: 'string',
              example: 'Consulta de rotina'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acesso inválido ou expirado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Token inválido',
                code: 'UNAUTHORIZED'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acesso negado - permissões insuficientes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Acesso negado',
                code: 'FORBIDDEN'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Recurso não encontrado',
                code: 'NOT_FOUND'
              }
            }
          }
        },
        ValidationError: {
          description: 'Dados de entrada inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Erro interno do servidor',
                code: 'INTERNAL_ERROR'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticação e autorização'
      },
      {
        name: 'Users',
        description: 'Gerenciamento de usuários'
      },
      {
        name: 'Professionals',
        description: 'Gerenciamento de profissionais de saúde'
      },
      {
        name: 'Bookings',
        description: 'Sistema de agendamentos'
      },
      {
        name: 'Health',
        description: 'Monitoramento de saúde da aplicação'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js'
  ]
}

const specs = swaggerJsdoc(options)

module.exports = specs

