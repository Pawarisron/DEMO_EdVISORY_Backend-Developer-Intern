import { User } from './../entities/user';
import { UserPrincipleRequest, UserPrinciple } from '../types/UserPrincipleRequest';
import { FastifyReply } from 'fastify';
import { FastifyRequest } from 'fastify';
import { config } from '../../config';
import crypto from "crypto";
import { redis } from '../database/redis';

const whitelistPaths = ["/login",config.swaggerPath];

export default async function auth( req:UserPrincipleRequest, reply:FastifyReply) {
    const url = req.raw.url || '';

    //Check Whitelist
    if (whitelistPaths.some(path => url.startsWith(path))) {
        return;
    }
    //get x-paw-key from header
    const pawKey = req.headers["x-paw-key"];

    if(pawKey && await verifyAcessToken(pawKey as string)){
        //create user principal
        const [userId] = (pawKey as string).split(".");
        req.user = {
            id: userId,
        };
        return; 
    }else{
        return reply.code(401).send({error: "Unauthorized!"})
    }
}

async function verifyAcessToken(accessToken:string): Promise<boolean>{
    const [userId, uuid, signature] = accessToken.split(".");
    if (!userId || !uuid || !signature) return false;

    //check signature
    const hmac = crypto.createHmac("sha256", config.secret);
    hmac.update(`${userId}.${uuid}`);
    const expectedSignature = hmac.digest("hex");

    const isSignatureValid  = expectedSignature === signature;

    //Check section in redis is valid ?
    if(await redis.exists(`${userId}:${accessToken}`) && isSignatureValid ){
        console.log("authorization:", isSignatureValid );
        return true;
    }
    
    return false
        
}
