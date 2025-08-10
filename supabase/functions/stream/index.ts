// @ts-expect-error - Supabase module type declarations not available
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
// @ts-expect-error - Deno module type declarations not available
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-expect-error - Deno module type declarations not available
import OpenAI from 'https://deno.land/x/openai@v4.52.7/mod.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface StreamRequest {
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
    max_tokens?: number;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Create Supabase client
        const supabaseClient = createClient(
            // @ts-expect-error - Deno global not available in types
            Deno.env.get('SUPABASE_URL') ?? '',
            // @ts-expect-error - Deno global not available in types
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        );

        // Verify user authentication
        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize OpenAI client
        // @ts-expect-error - Deno global not available in types
        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
            throw new Error('OPENAI_API_KEY is not set');
        }

        const openai = new OpenAI({
            apiKey: openaiApiKey,
        });

        if (req.method === 'POST') {
            const body: StreamRequest = await req.json();
            const { messages, model = 'gpt-4o-mini', temperature = 0.7, max_tokens = 1000 } = body;

            // Create streaming chat completion
            const stream = await openai.chat.completions.create({
                model,
                messages,
                temperature,
                max_completion_tokens: max_tokens,
                stream: true,
            });

            // Create a ReadableStream to handle the OpenAI stream
            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of stream) {
                            const delta = chunk.choices[0]?.delta;
                            if (delta?.content) {
                                const data = `data: ${JSON.stringify({
                                    type: 'content',
                                    content: delta.content,
                                    user_id: user.id,
                                })}\n\n`;
                                controller.enqueue(new TextEncoder().encode(data));
                            }

                            if (chunk.choices[0]?.finish_reason === 'stop') {
                                const data = `data: ${JSON.stringify({
                                    type: 'done',
                                    user_id: user.id,
                                })}\n\n`;
                                controller.enqueue(new TextEncoder().encode(data));
                                break;
                            }
                        }
                    } catch (error) {
                        console.error('Streaming error:', error);
                        const errorData = `data: ${JSON.stringify({
                            type: 'error',
                            error: error.message,
                        })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(errorData));
                    } finally {
                        controller.close();
                    }
                },
            });

            return new Response(readableStream, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            });
        }

        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Stream function error:', error);
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                message: error.message,
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
