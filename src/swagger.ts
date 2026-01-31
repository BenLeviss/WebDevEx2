import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const definition = {
  openapi: "3.0.0",
  info: {
    title: "WebDevEx2 API",
    version: "1.0.0",
    description: "Full API documentation including Auth, Users, Posts, and Comments.",
  },
  servers: [{ url: "http://localhost:3000", description: "Local server" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      Post: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "string", description: "User ID" },
        },
        required: ["title", "content"],
      },
      Comment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          content: { type: "string" },
          postId: { type: "string" },
          userId: { type: "string" },
        },
        required: ["content"],
      },
    },
  },
};

const options = {
  definition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options as any);

export const setupSwagger = (app: Express) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec as any));
};

export default swaggerSpec;
