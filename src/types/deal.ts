import * as z from "zod";

export const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
export const PERSIAN = "۰۱۲۳۴۵۶۷۸۹"; 

export const currencyOpt = [
    "EUR",
    "ILS",
    "USD"
] as const;

const currencyEnum = z.enum(currencyOpt);

export const createDealSchema = z.object({
    provider_id: z.uuid(),
    client_id: z.uuid(),
    conversation_id: z.uuid(),
    service_id: z.uuid().nullable(),
    price: z.number().positive().max(1_000_000),
    currency: currencyEnum
})

export type CreateDealSchemaType = z.infer<typeof createDealSchema>