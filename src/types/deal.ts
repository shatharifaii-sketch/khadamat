import * as z from "zod";

export const currencyOpt = [
    "EUR",
    "ILS",
    "USD"
]

const currencyEnum = z.enum(currencyOpt);

export const createDealSchema = z.object({
    provider_id: z.uuid(),
    client_id: z.uuid(),
    conversation_id: z.uuid(),
    service_id: z.uuid().nullable(),
    price: z.number(),
    currency: currencyEnum
})

export type CreateDealSchemaType = z.infer<typeof createDealSchema>