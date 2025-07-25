#!/usr/bin/env node

// Standalone script to test OpenAI configuration
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root
config({ path: join(__dirname, '../../.env') });

// Import the test function
import { runOpenAITest } from './src/utils/testOpenAI.js';

// Run the test
runOpenAITest().catch(console.error);
