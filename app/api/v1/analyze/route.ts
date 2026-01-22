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

        // Clean HTML to reduce token usage
        // Remove scripts, styles, and SVG paths but keep structure and text
        const cleanedHtml = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '<svg></svg>')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 15000); // Limit to ~15k chars for safety

        let systemPrompt = "You are an expert product analyst. Analyze HTML content and return JSON metadata for a product demo.";
        let userPrompt = "";

        if (type === 'demo_info') {
            userPrompt = `
Analyze this web page HTML to determine what this product/feature is.
Generate a concise demo title and a 2-sentence description.

HTML: ${cleanedHtml}

Return ONLY JSON:
{
  "title": "Action-Oriented Title",
  "description": "Short description."
}
`;
        } else {
            userPrompt = `
Analyze this screen HTML and the action context.
Action Context: ${JSON.stringify(context)}

Generate a descriptive step name and a short instructional script.

HTML: ${cleanedHtml}

Return ONLY JSON:
{
  "label": "Brief action (e.g., Click Settings)",
  "script": "Instruction for the user."
}
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
