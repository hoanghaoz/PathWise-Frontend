import type { GraphSkill, NodeResult } from "../../shared/skillGraph";

// Static illustration from the design's landing page: an example assessment
// result on part of the "Backend Web" graph. Not loaded from the API.

export const HERO_SKILLS: GraphSkill[] = [
  {
    slug: "js-ts-co-ban",
    name: "JavaScript/TypeScript cơ bản",
    short: "JS/TS cơ bản",
    prereqs: [],
  },
  {
    slug: "http-rest-co-ban",
    name: "HTTP & REST cơ bản",
    short: "HTTP & REST",
    prereqs: [],
  },
  {
    slug: "nodejs-express-co-ban",
    name: "Node.js & Express cơ bản",
    short: "Node.js & Express",
    prereqs: ["http-rest-co-ban", "js-ts-co-ban"],
  },
  {
    slug: "nestjs-co-ban",
    name: "NestJS cơ bản",
    short: "NestJS cơ bản",
    prereqs: ["nodejs-express-co-ban"],
  },
  {
    slug: "authentication-jwt",
    name: "Authentication & JWT",
    short: "Auth & JWT",
    prereqs: ["nestjs-co-ban"],
  },
  {
    slug: "validation-dto",
    name: "Validation & DTO",
    short: "Validation & DTO",
    prereqs: ["nestjs-co-ban"],
  },
  {
    slug: "authorization-rbac",
    name: "Authorization & RBAC",
    short: "Authorization & RBAC",
    prereqs: ["authentication-jwt"],
  },
  {
    slug: "api-docs-swagger",
    name: "API Docs (Swagger/OpenAPI)",
    short: "Swagger/OpenAPI",
    prereqs: ["nestjs-co-ban", "validation-dto"],
  },
];

export const HERO_RESULTS: Record<string, NodeResult> = {
  "js-ts-co-ban": { status: "MASTERED", source: "ANSWERED" },
  "http-rest-co-ban": { status: "MASTERED", source: "ANSWERED" },
  "nodejs-express-co-ban": { status: "PARTIAL", source: "ANSWERED" },
  "nestjs-co-ban": { status: "NOT_MASTERED", source: "ANSWERED" },
  "authentication-jwt": { status: "NOT_MASTERED", source: "INFERRED" },
  "validation-dto": { status: "NOT_MASTERED", source: "INFERRED" },
  "authorization-rbac": { status: "NOT_MASTERED", source: "INFERRED" },
  "api-docs-swagger": { status: "NOT_MASTERED", source: "INFERRED" },
};

export const HERO_TARGETS = new Set(["authorization-rbac", "api-docs-swagger"]);
