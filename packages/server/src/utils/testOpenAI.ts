import OpenAI from 'openai';
import { openaiService } from '../services/openai.js';

export async function testOpenAIConnection(): Promise<{ success: boolean; message: string; model?: string }> {
    try {
        // Reinitialize the service to pick up any env changes
        openaiService.reinitialize();

        // Check if service is initialized
        if (!openaiService.isInitialized()) {
            return {
                success: false,
                message: openaiService.getInitError() || 'OpenAI service not initialized',
            };
        }

        // Check if API key is configured
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            return {
                success: false,
                message: 'OPENAI_API_KEY environment variable is not set or still has placeholder value',
            };
        }

        if (!apiKey.startsWith('sk-')) {
            return {
                success: false,
                message: 'Invalid OpenAI API key format. Key should start with "sk-"',
            };
        }

        // Test basic API connectivity with a simple message
        const testMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
            role: 'user',
            content:
                'Hello! This is a test message to verify API connectivity. Please respond with "API connection successful".',
        };

        const response = await openaiService.createChatCompletion([testMessage]);

        if (!response || !response.content) {
            return {
                success: false,
                message: 'OpenAI API returned an empty response',
            };
        }

        return {
            success: true,
            message: 'OpenAI API connection successful',
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        };
    } catch (error: unknown) {
        let errorMessage = 'Unknown error occurred';

        if (error && typeof error === 'object' && 'status' in error) {
            const statusError = error as { status: number; message?: string };
            if (statusError.status === 401) {
                errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.';
            } else if (statusError.status === 429) {
                errorMessage = 'OpenAI API rate limit exceeded or insufficient credits.';
            } else if (statusError.status === 503) {
                errorMessage = 'OpenAI API is currently unavailable. Please try again later.';
            } else if (statusError.message) {
                errorMessage = `OpenAI API Error: ${statusError.message}`;
            }
        }

        return {
            success: false,
            message: errorMessage,
        };
    }
}

export async function runOpenAITest(): Promise<void> {
    // eslint-disable-next-line no-console
    console.log('🔍 Testing OpenAI API configuration...\n');

    const result = await testOpenAIConnection();

    if (result.success) {
        // eslint-disable-next-line no-console
        console.log('✅ OpenAI API Test Results:');
        // eslint-disable-next-line no-console
        console.log(`   Status: ${result.message}`);
        // eslint-disable-next-line no-console
        console.log(`   Model: ${result.model}`);
        // eslint-disable-next-line no-console
        console.log(
            `   API Key: ${process.env.OPENAI_API_KEY?.substring(0, 7)}...${process.env.OPENAI_API_KEY?.slice(-4)}`
        );
    } else {
        // eslint-disable-next-line no-console
        console.log('❌ OpenAI API Test Failed:');
        // eslint-disable-next-line no-console
        console.log(`   Error: ${result.message}`);
        // eslint-disable-next-line no-console
        console.log('\n💡 Troubleshooting tips:');
        // eslint-disable-next-line no-console
        console.log('   1. Make sure .env file exists in the project root');
        // eslint-disable-next-line no-console
        console.log('   2. Check that OPENAI_API_KEY is set correctly');
        // eslint-disable-next-line no-console
        console.log('   3. Verify your OpenAI account has sufficient credits');
        // eslint-disable-next-line no-console
        console.log('   4. Ensure your API key has not expired');
    }

    // eslint-disable-next-line no-console
    console.log('\n' + '='.repeat(50));
}
