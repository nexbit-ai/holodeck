import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Check for auth header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }

    // Return dummy user info
    return NextResponse.json({
        id: "user_default",
        email: "test@nexbit.io",
        organizationId: "org_default",
        organizationName: "Nexbit Dev"
    }, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
