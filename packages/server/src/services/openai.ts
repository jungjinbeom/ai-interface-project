import OpenAI from 'openai';

export class OpenAIService {
    private client: OpenAI | null = null;
    private model: string = 'gpt-4o-mini';
    private maxTokens: number = 1000;
    private temperature: number = 0.7;
    private initialized: boolean = false;
    private initError: string | null = null;

    constructor() {
        this.initialize();
    }

    // Method to reinitialize the service (useful when env vars change)
    reinitialize() {
        this.initialize();
    }

    async createChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
        this.checkInitialized();
        try {
            const completion = await this.client!.chat.completions.create({
                model: this.model,
                messages,
                temperature: this.temperature,
                max_completion_tokens: this.maxTokens,
            });

            return completion.choices[0]?.message;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw error;
        }
    }

    async createStreamingChatCompletion(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
        this.checkInitialized();
        try {
            const stream = await this.client!.chat.completions.create({
                model: this.model,
                messages,
                temperature: this.temperature,
                max_completion_tokens: this.maxTokens,
                stream: true,
            });

            return stream;
        } catch (error) {
            console.error('OpenAI Streaming API Error:', error);
            throw error;
        }
    }

    // Getter methods for accessing configuration
    getModel(): string {
        return this.model;
    }

    getMaxTokens(): number {
        return this.maxTokens;
    }

    getTemperature(): number {
        return this.temperature;
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    getInitError(): string | null {
        return this.initError;
    }

    private initialize() {
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey || apiKey === 'your_openai_api_key_here') {
                this.initError = 'OPENAI_API_KEY environment variable is not set or still has placeholder value';
                console.warn('OpenAI service not initialized: API key not configured');
                this.initialized = false;
            } else {
                this.client = new OpenAI({
                    apiKey,
                });
                this.initialized = true;
                this.initError = null;
                console.info('OpenAI service initialized successfully');
            }

            // Configure model and settings from environment variables
            this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
            this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '1000');
            this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE || '0.7');
        } catch (error) {
            this.initError = `Failed to initialize OpenAI service: ${error}`;
            console.error(this.initError);
            this.initialized = false;
        }
    }

    private checkInitialized() {
        if (!this.initialized || !this.client) {
            throw new Error(this.initError || 'OpenAI service not properly initialized');
        }
    }
}

export const openaiService = new OpenAIService();
