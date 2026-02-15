import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(request: NextRequest) {
    try {
        const { html, context, type } = await request.json();

        if (!OPENAI_API_KEY) {
            console.warn('[AI] OPENAI_API_KEY not found in environment variables');
            return NextResponse.json({
                error: 'AI integration not configured. Please add OPENAI_API_KEY to your .env file.'
            }, { status: 500 });
        }

        const demoTitle = context?.demoTitle || "this product";

        // Helper to detect noise (cookie banners, etc) - aggressively filter for storytelling
        const isNoise = (tag: string, attrs: string) => {
            const combined = (tag + attrs).toLowerCase();
            return combined.includes('cookie') ||
                combined.includes('consent') ||
                combined.includes('onetrust') ||
                combined.includes('trustarc') ||
                combined.includes('banner') ||
                combined.includes('privacy');
        };

        // 1. Identify Target (Extension now marks this with data-ai-target="primary")
        let targetDescription = "unknown element";
        if (type === 'step_info') {
            const targetRegex = /<([a-z0-9-]+)\b[^>]*data-ai-target="primary"[^>]*>(.*?)<\/\1>/i;
            const match = html.match(targetRegex);
            if (match) {
                const tagName = match[1];
                const content = match[2].replace(/<[^>]*>/g, '').trim().substring(0, 100);
                targetDescription = `${tagName}${content ? ` with text "${content}"` : ''}`;
            }
        }

        // 2. Clean HTML - High fidelity for semantic info, low volume for tokens
        const cleanedHtml = html
            // Remove scripts and styles
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            // Keep SVGs but empty them
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '<svg></svg>')
            // Remove styles and classes to save massive token amount
            .replace(/\s+style="[^"]*"/gi, '')
            .replace(/\s+class="[^"]*"/gi, '')
            // Remove noise elements entirely (including their content)
            .replace(/<([a-z0-9-]+)\b([^>]*)>(.*?)<\/\1>/gi, (match: string, tag: string, attrs: string) => {
                if (isNoise(tag, attrs)) return '';
                return match;
            })
            // Collapse redundant coordinates
            .replace(/\s+data-ai-(x|y|w|h)="[^"]*"/gi, '')
            // Keep critical identifiers
            .replace(/\s+data-([a-z0-9-]+)="[^"]*"/gi, (match: string) => {
                const key = match.toLowerCase();
                if (key.includes('data-ai-target') ||
                    key.includes('data-testid') ||
                    key.includes('data-id') ||
                    key.includes('data-label') ||
                    key.includes('aria-')) {
                    return match;
                }
                return '';
            })
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 20000);

        let systemPrompt = "You are a senior product documentation expert. Your goal is to write a compelling, story-driven guide for a product demo.";
        let userPrompt = "";

        if (type === 'demo_info') {
            userPrompt = `
Analyze this web page HTML to understand the product.
Create a high-impact, action-oriented title and a 2-sentence value-based description.

HTML: ${cleanedHtml}

Return ONLY JSON:
{
  "title": "...",
  "description": "..."
}
`;
        } else {
            userPrompt = `
Context: The user is creating a demo titled "${demoTitle}". 
Goal: Write a VERY CONCISE instruction for this specific interaction.

Action: The user clicked on "${targetDescription}".

CRITICAL RULES:
1. Be EXTREMELY BRIEF (under 10 words).
2. Format: "Action + Context" (e.g., "Click Pricing to see plans" or "Open Docs to learn more").
3. DO NOT tell a story. Just describe the immediate value of the click.
4. If no marked target is found, return empty strings.

Return ONLY JSON:
{
  "label": "Action Verb + Target",
  "script": "A very short, punchy sentence."
}

HTML: ${cleanedHtml}
`;
        }

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[AI] OpenAI API error:', error);
            throw new Error(`OpenAI API failed with status ${response.status}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('No content returned from AI');
        }

        // Parse the JSON output from LLM
        const aiData = JSON.parse(content);

        return NextResponse.json(aiData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });

    } catch (error) {
        console.error('Error in AI analysis:', error);
        return NextResponse.json(
            { error: 'Failed to analyze UI with AI' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
