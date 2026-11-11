// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function deactivateUserSubscriptions(user_id: string) {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", user_id)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching subscriptions:", error);
    throw new Error("Error fetching subscriptions");
  }

  if (subscriptions && subscriptions.length > 0) {
    const subscriptionIds = subscriptions.map((sub) => sub.id);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "inactive" })
      .in("id", subscriptionIds);

    if (updateError) {
      console.error("Error deactivating subscriptions:", updateError);
      throw new Error("Error deactivating subscriptions");
    }
  }

  return { success: true, message: "User subscriptions deactivated successfully" };
}

async function deleteUserConvos(user_id: string) {
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id")
    .or(`client_id.eq.${user_id},provider_id.eq.${user_id}`);

  if (error) {
    console.error("Error fetching conversations:", error);
    throw new Error("Error fetching conversations");
  }

  if (conversations && conversations.length > 0) {
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("id")
      .in("conversation_id", conversations.map((convo) => convo.id));

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw new Error("Error fetching messages");
    }

    if (messages && messages.length > 0) {
      const messageIds = messages.map((msg) => msg.id);

      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .in("id", messageIds);

      if (deleteError) {
        console.error("Error deleting messages:", deleteError);
        throw new Error("Error deleting messages");
      }
    }

    const conversationIds = conversations.map((convo) => convo.id);

    const { error: deleteError } = await supabase
      .from("conversations")
      .delete()
      .in("id", conversationIds);

    if (deleteError) {
      console.error("Error deleting conversations:", deleteError);
      throw new Error("Error deleting conversations");
    }
  }

  return { success: true, message: "User conversations deleted successfully" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "missing_user_id"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deactivateResult = await deactivateUserSubscriptions(user_id);

    if (!deactivateResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: "failed_to_deactivate_subscriptions"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deleteConvosResult = await deleteUserConvos(user_id);

    if (!deleteConvosResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: "failed_to_delete_conversations"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete the user profile from Supabase
    const { error } = await supabase.auth.admin.deleteUser(user_id);

    if (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      error: null
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: "server_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/delete-user-profile' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
