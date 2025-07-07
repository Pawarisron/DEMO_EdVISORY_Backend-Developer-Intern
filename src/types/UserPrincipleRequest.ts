
import { FastifyRequest } from "fastify";

//UserPrinciple
export interface UserPrinciple {
  id: string;
}

//For custom Fastify Request
export interface UserPrincipleRequest extends FastifyRequest {
  user?: UserPrinciple;
}
