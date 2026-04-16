export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Interactive Urban Farming Platform API",
    version: "1.0.0",
    description: "Backend API for authentication, rentals, marketplace, tracking, and community.",
  },
  servers: [{ url: "http://localhost:5000" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ApiSuccess: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation successful" },
          data: {},
          meta: { type: "object", nullable: true },
          timestamp: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/api/v1/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": { description: "Server is healthy" },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        summary: "Register user",
        responses: {
          "201": { description: "User registered" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "customer1@urbanfarm.com" },
                  password: { type: "string", example: "Password123!" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        summary: "Get current user profile",
        responses: {
          "200": { description: "Profile fetched" },
          "401": { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/produces": {
      get: {
        summary: "List marketplace produces with pagination",
        responses: {
          "200": { description: "Produces fetched" },
        },
      },
      post: {
        summary: "Create produce listing (Vendor)",
        responses: {
          "201": { description: "Produce created" },
          "403": { description: "Vendor-only or certification not approved" },
        },
      },
    },
    "/api/v1/rentals": {
      get: {
        summary: "List rental spaces with location search",
        responses: {
          "200": { description: "Rental spaces fetched" },
        },
      },
      post: {
        summary: "Create rental space (Vendor)",
        responses: {
          "201": { description: "Rental space created" },
        },
      },
    },
    "/api/v1/rentals/{id}/book": {
      post: {
        summary: "Book rental space (Customer)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "201": { description: "Rental space booked" },
        },
      },
    },
    "/api/v1/orders": {
      get: {
        summary: "List orders with pagination",
        responses: {
          "200": { description: "Orders fetched" },
        },
      },
      post: {
        summary: "Create order (Customer)",
        responses: {
          "201": { description: "Order created" },
        },
      },
    },
    "/api/v1/community/posts": {
      get: {
        summary: "List community posts",
        responses: {
          "200": { description: "Posts fetched" },
        },
      },
      post: {
        summary: "Create community post",
        responses: {
          "201": { description: "Post created" },
        },
      },
    },
    "/api/v1/tracking/plants": {
      get: {
        summary: "List plant tracking records for current user",
        responses: {
          "200": { description: "Plant tracking fetched" },
        },
      },
      post: {
        summary: "Create plant tracking record",
        responses: {
          "201": { description: "Tracking created" },
        },
      },
    },
    "/api/v1/tracking/plants/{id}": {
      patch: {
        summary: "Update plant tracking record",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Tracking updated" },
        },
      },
    },
    "/api/v1/certifications/me": {
      get: {
        summary: "Vendor certifications",
        responses: {
          "200": { description: "Certifications fetched" },
        },
      },
    },
    "/api/v1/certifications/submit": {
      post: {
        summary: "Submit sustainability certification (Vendor)",
        responses: {
          "201": { description: "Certification submitted" },
        },
      },
    },
    "/api/v1/admin/vendors/pending": {
      get: {
        summary: "List pending vendors (Admin)",
        responses: {
          "200": { description: "Pending vendors fetched" },
        },
      },
    },
    "/api/v1/admin/vendors/{id}/approve": {
      patch: {
        summary: "Approve or reject vendor (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Vendor approval status updated" },
        },
      },
    },
    "/api/v1/admin/certifications/pending": {
      get: {
        summary: "List pending certifications (Admin)",
        responses: {
          "200": { description: "Pending certifications fetched" },
        },
      },
    },
    "/api/v1/admin/certifications/{id}/validate": {
      patch: {
        summary: "Validate certification (Admin)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Certification validated" },
        },
      },
    },
  },
};
