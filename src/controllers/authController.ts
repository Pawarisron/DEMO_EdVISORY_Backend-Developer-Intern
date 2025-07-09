import { FastifyReply, FastifyRequest } from "fastify";
import { v4 as uuid4 } from "uuid";
import crypto from "crypto";
import { config } from "../../config";
import { redis } from "../database/redis";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import { User } from "../entities/User";
import { AppDataSource } from "../database/dataSource";

export const login = async(req:FastifyRequest, reply:FastifyReply)=>{

    const basic = req.headers.authorization;
    //Check basic
    if (!basic || !basic.startsWith("Basic ")) {
        return reply.status(401).send({ message: req.i18n.t('err_unauthorized') });
    }
    //Decoding
    const credentialBase64 = basic.slice(6);
    const decoded = Buffer.from(credentialBase64, 'base64').toString('utf-8');
    const [username, password] = decoded.split(":");

    try {
        //query user
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.find({
            where: {
                username: username,
                passwordHash: password, 
            },
            select: ['id','username','passwordHash'],  
        })
        //check username password
        if (username !== user[0].username || password !== user[0].passwordHash) {
            return reply.status(401).send({ message: req.i18n.t("invalid_credentials") });
        }
        //access token
        const accessToken = await generateAccessToken(user[0].id)
        return reply.status(200).send({
            access_token: accessToken,
            token_type: "x-paw-key",
        });

    } catch (error) {
        reply.code(401).send({ message: req.i18n.t("invalid_credentials") ,detail: error});
    }
}

//Logout single id
export const logout = async(req:UserPrincipleRequest, reply:FastifyReply)=>{
    const userId = req.user?.id;
    const sectionId = req.user?.sectionId;
    if (!userId || !sectionId) {
        return reply.code(401).send({ message: req.i18n.t("err_unauthorized") });
    }
    //Clear section in redis
    await redis.del(`${userId}:${sectionId}`);
    return reply.send({
        message: req.i18n.t("logout_sessions_success"),
        userID: req.user?.id,
        sectionID: req.user?.sectionId,
    }).status(200)
}

//Logout all device
export const logoutAll = async (req: UserPrincipleRequest, reply: FastifyReply) => {
    const userId = req.user?.id;
    if (!userId) {
        return reply.code(401).send({ message: req.i18n.t("err_unauthorized") });
    }

    let cursor = '0';
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", `${userId}:*`, "COUNT", 100);
        if (keys.length > 0) {
            //clear in redis
            await redis.del(...keys);
        }
        cursor = nextCursor;
    } while (cursor !== '0');

    return reply.code(200).send({
        message: req.i18n.t("logout_all_sessions_success"),
        userID: userId,
    });
};


async function generateAccessToken( userId:string ): Promise<string> {
    //gen uuid
    const uuid = uuid4();
    //sign signature
    const hmac = crypto.createHmac("sha256", config.secret);
    //hash uuid and userID
    hmac.update(`${userId}.${uuid}`);
    const signature = hmac.digest("hex");
    const accessToken = `${userId}.${uuid}.${signature}`;

    //store in redis group by userID
    await redis.setex(`${userId}:${accessToken}`, config.redisTimeToLive, "1")
    console.log("created sectionID:", accessToken);
    return accessToken;
}
