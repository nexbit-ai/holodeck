import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Path to the holodeck-recordings folder in Downloads
const RECORDINGS_DIR = path.join(os.homedir(), 'Downloads', 'holodeck-recordings');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ demoId: string }> | { demoId: string } }
) {
    try {
        // Handle both Promise and direct params (Next.js 13+ compatibility)
        const resolvedParams = params instanceof Promise ? await params : params;
        const demoId = resolvedParams.demoId;

        const searchParams = request.nextUrl.searchParams;
        const organizationId = searchParams.get('organization_id');

        if (!organizationId) {
            return NextResponse.json(
                { detail: "organization_id query parameter is required" },
                {
                    status: 422,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                }
            );
        }

        // Sanitize the filename to prevent directory traversal
        const sanitizedId = path.basename(demoId);
        let fileName = sanitizedId;
        if (!fileName.endsWith('.json')) {
            fileName = `${fileName}.json`;
        }
        const filePath = path.join(RECORDINGS_DIR, fileName);

        console.log(`[API] Fetching recording for ID: ${demoId} at path: ${filePath}`);

        try {
            await fs.access(filePath);
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            const stats = await fs.stat(filePath);

            // Map data to the requested contract response schema
            // We use values from the saved JSON if they exist, otherwise derive them
            const response = {
                id: demoId.replace('.json', ''),
                name: data.name || `Recording ${stats.mtime.toISOString().replace(/T/, ' ').replace(/\..+/, '')}`,
                organization_id: organizationId,
                source_url: data.sourceUrl || (data.snapshots && data.snapshots[0]?.url) || "",
                duration: data.duration !== undefined ? data.duration : (data.snapshots && data.snapshots.length > 1 ? Math.round((data.snapshots[data.snapshots.length - 1].timestamp - data.snapshots[0].timestamp) / 1000) : 0),
                event_count: data.eventCount !== undefined ? data.eventCount : (data.snapshots ? data.snapshots.length : 0),
                events: data.snapshots || data.events || [],
                metadata: data.metadata || {
                    browserName: "Chrome",
                    screenWidth: 1920,
                    screenHeight: 1080
                },
                created_at: data.uploadedAt || stats.birthtime.toISOString(),
                created_by: data.createdBy || "user_default"
            };

            return NextResponse.json(response, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });

        } catch (err) {
            console.error(`[API] Recording not found: ${filePath}`);
            return NextResponse.json(
                { detail: "Recording not found" },
                {
                    status: 404,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                }
            );
        }
    } catch (error) {
        console.error('Error fetching recording:', error);
        return NextResponse.json(
            { detail: "Internal server error" },
            {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
