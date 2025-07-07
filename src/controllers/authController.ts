import { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { config } from "../../config";
import { redis } from "../database/redis";

export const login = async(req:FastifyRequest, reply:FastifyReply)=>{

    const basic = req.headers.authorization;
    //Check basic
    if (!basic || !basic.startsWith("Basic ")) {
        return reply.status(401).send({ message: "Unauthorized" });
    }
    //Decoding
    const credentialBase64 = basic.slice(6);
    const decoded = Buffer.from(credentialBase64, 'base64').toString('utf-8');
    const [username, password] = decoded.split(":");

    //TODO for testing
    if (username !== 'admin' || password !== '1234') {
        return reply.status(401).send({ message: "Invalid credentials" });
    }
    const userId = "10602"
    //END TEST

    const accessToken = await generateAccessToken(userId)
    return reply.status(200).send({
        access_token: accessToken,
        token_type: "x-paw-key",
    });
}

export const logout = async(req:FastifyRequest, reply:FastifyReply)=>{
    throw new Error("Function not implemented.");
}

export const logoutAll = async(req:FastifyRequest, reply:FastifyReply)=>{
    throw new Error("Function not implemented.");
}

async function generateAccessToken( userId:string ): Promise<string> {
    //gen uuid
    const uuid = uuidv4();
    //sign signature
    const hmac = crypto.createHmac("sha256", config.secret);
    //hash uuid and userID
    hmac.update(`${userId}.${uuid}`);
    const signature = hmac.digest("hex");
    const accessToken = `${userId}.${uuid}.${signature}`;

    //store in redis group by userID
    await redis.setex(`${userId}:${accessToken}`, config.redisTimeToLive, "1")
    console.log("creted sectionID:", accessToken)
    return accessToken;
}
