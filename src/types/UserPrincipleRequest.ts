
import { FastifyRequest } from "fastify";

//UserPrinciple
export interface UserPrinciple {
  id: string;
  sectionId: string;
}

//For custom Fastify Request
export interface UserPrincipleRequest extends FastifyRequest {
  user?: UserPrinciple;
}
