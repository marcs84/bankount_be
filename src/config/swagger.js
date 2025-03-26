const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bankout Crypto Project',
      version: '1.0.0',
      description: 'API documentation for Bankout Crypto application',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Invalid or missing token.',
          content: {
            'text/plain': {
              schema: {
                type: 'string',
                example: 'Unauthorized',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Forbidden - You do not have permission to access this resource.',
          content: {
            'text/plain': {
              schema: {
                type: 'string',
                example: 'Forbidden',
              },
            },
          },
        },
        ServerError: {
          description: 'Server error while processing the request',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  result: {
                    type: 'boolean',
                    example: false,
                  },
                  message: {
                    type: 'string',
                    example: 'An error occurred while processing the request: [error message]',
                  },
                  error: {
                    type: 'string',
                    example: '[error message]',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/server/**/*.js'], // Path to API routes
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
