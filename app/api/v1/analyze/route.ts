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

        let processedHtml = html;

        // 1. If it's a step analysis with click coordinates, identify the clicked element
        if (type === 'step_info' && context?.clickX !== undefined && context?.clickY !== undefined) {
            const { clickX, clickY } = context;

            // Regex to find all elements with a style attribute
            const elementRegex = /<([a-z0-9-]+)\b([^>]*\bstyle="([^"]+)"[^>]*)>/gi;
            let match;
            let bestInteractiveElement = null;
            let bestGenericElement = null;
            let minInteractiveArea = Infinity;
            let minGenericArea = Infinity;

            const interactiveTags = new Set(['button', 'a', 'input', 'select', 'textarea', 'summary']);

            while ((match = elementRegex.exec(html)) !== null) {
                const fullTag = match[0];
                const tagName = match[1].toLowerCase();
                const attributes = match[2];
                const styleValue = match[3];

                // Simple parser for inlined styles
                const getStyleProp = (prop: string) => {
                    const propRegex = new RegExp(`${prop}:\\s*(-?\\d+(\\.\\d+)?)px`, 'i');
                    const m = styleValue.match(propRegex);
                    return m ? parseFloat(m[1]) : null;
                };

                const top = getStyleProp('top');
                const left = getStyleProp('left');
                const width = getStyleProp('width');
                const height = getStyleProp('height');

                if (top !== null && left !== null && width !== null && height !== null) {
                    if (clickX >= left && clickX <= left + width &&
                        clickY >= top && clickY <= top + height) {

                        const area = width * height;
                        const isInteractive = interactiveTags.has(tagName) || attributes.toLowerCase().includes('role="button"');

                        if (isInteractive) {
                            if (area < minInteractiveArea && area > 0) {
                                minInteractiveArea = area;
                                bestInteractiveElement = { index: match.index, length: fullTag.length, tagName, attributes };
                            }
                        } else {
                            if (area < minGenericArea && area > 0) {
                                minGenericArea = area;
                                bestGenericElement = { index: match.index, length: fullTag.length, tagName, attributes };
                            }
                        }
                    }
                }
            }

            const bestElement = bestInteractiveElement || bestGenericElement;

            if (bestElement) {
                const markedTag = `<${bestElement.tagName} data-ai-clicked="true" ${bestElement.attributes}>`;
                processedHtml = html.substring(0, bestElement.index) +
                    markedTag +
                    html.substring(bestElement.index + bestElement.length);
            }
        }

        // 2. Clean HTML to reduce token usage and allow more context
        // We preserve more descriptive attributes but strip the bulky styles
        const cleanedHtml = processedHtml
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '<svg></svg>')
            // Remove style attributes
            .replace(/\s+style="[^"]*"/gi, '')
            // Remove most data attributes but keep critical ones
            .replace(/\s+data-([a-z0-9-]+)="[^"]*"/gi, (match: string) => {
                const key = match.toLowerCase();
                if (key.includes('data-ai-clicked') ||
                    key.includes('data-testid') ||
                    key.includes('data-id') ||
                    key.includes('data-label')) {
                    return match;
                }
                return '';
            })
            // Remove other noise while keeping labels
            .replace(/\s+onload="[^"]*"/gi, '')
            .replace(/\s+onerror="[^"]*"/gi, '')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 60000); // Expanded context to 60k chars

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
IMPORTANT: The user clicked on a specific element marked with 'data-ai-clicked="true"'. 
Your task is to identify THIS specific element (the button, link, or input actually clicked) and describe its action.

Look for:
1. The element with data-ai-clicked="true".
2. Its text content and surrounding labels.
3. Its ID, class, title, or ARIA attributes if present.

Action Context: ${JSON.stringify(context)}

Generate a descriptive step name (label) and a short instructional script (script).
Example: 
{
  "label": "Click 'Sign Up'",
  "script": "Click the Sign Up button to create your account."
}

HTML: ${cleanedHtml}

Return ONLY JSON:
{
  "label": "...",
  "script": "..."
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
