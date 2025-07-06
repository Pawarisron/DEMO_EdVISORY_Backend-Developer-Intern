import { FastifyReply, FastifyRequest } from "fastify";

import { items } from "../entities/items";
import { Item } from "../models/Item";

import { itemIdSchema } from "../schemas/itemSchema";

interface Params {
    id: string;
}

//Get all items
export const getItems = async (_: FastifyRequest, reply: FastifyReply) => {
    return reply.code(200).send(items);
};

//Get single items by id
export const getItemById = async (req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    
    //validate
    const { error } = itemIdSchema.validate(req.params);
    if (error) {
        return reply.code(400).send({ message: error.details[0].message });
    }

    const { id } = req.params;
    const item = items.find((item: Item) => item.id === id);

    //not found
    if (!item) {
        return reply.code(404).send({ message: `Item with ID ${id} not found.` });
    }
    return reply.code(200).send(item);
};
