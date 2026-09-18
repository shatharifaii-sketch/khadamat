import * as z from "zod";

export const createDealSchema = z.object({
    provider_id: z.uuid(),
    client_id: z.uuid(),
    conversation_id: z.uuid(),
    created_by: z.string(),
    service_id: z.uuid().nullable(),
    price: z.number(),
})

export type CreateDealSchemaType = z.infer<typeof createDealSchema>