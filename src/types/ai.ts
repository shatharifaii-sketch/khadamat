export type ChartRole = "user" | "assistant";

export interface ChatMessage {
    id: string;
    role: ChartRole;
    content: string;
    created_at?: string;
}