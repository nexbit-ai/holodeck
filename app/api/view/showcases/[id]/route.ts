import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '../../../../utils/config';

/**
 * Public API endpoint to fetch showcase by ID (no auth required)
 * This endpoint calls the backend public API endpoint
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const showcaseId = resolvedParams.id;

        if (!showcaseId) {
            return NextResponse.json(
                { error: 'Showcase ID is required' },
                { status: 400 }
            );
        }

        // Fetch showcase from backend public API endpoint
        // Use the dedicated public router so portal and public URLs are cleanly separated
        const backendUrl = `${API_BASE_URL}/public/showcases/${showcaseId}`;
        
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Showcase not found or not available' },
                    { status: 404 }
                );
            }
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.detail || 'Failed to fetch showcase' },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        // Transform snake_case to camelCase for frontend
        const transformedData = {
            id: data.id || data.showcase_id,
            title: data.title,
            organizationId: data.organizationId || data.organization_id,
            demoId: data.demoId || data.demo_id || null,
            chatId: data.chatId || data.chat_id || null,
            primaryColor: data.primaryColor || data.primary_color || null,
            secondaryColor: data.secondaryColor || data.secondary_color || null,
            accentColor: data.accentColor || data.accent_color || null,
            showcaseShareLink: data.showcaseShareLink || data.showcase_share_link || null,
            live: data.live ?? false,
            createdAt: data.createdAt || data.created_at,
            updatedAt: data.updatedAt || data.updated_at
        };

        return NextResponse.json(transformedData, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        console.error('Error fetching showcase:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to fetch showcase' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
