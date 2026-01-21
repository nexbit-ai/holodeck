import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Path to the holodeck-recordings folder in Downloads
const RECORDINGS_DIR = path.join(os.homedir(), 'Downloads', 'holodeck-recordings');

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        // Ensure the directory exists
        try {
            await fs.access(RECORDINGS_DIR);
        } catch {
            await fs.mkdir(RECORDINGS_DIR, { recursive: true });
        }

        // Generate a unique ID if not provided
        const id = `recording-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const filePath = path.join(RECORDINGS_DIR, id);

        // Include metadata in the saved file
        const recordingData = {
            id: id,
            name: payload.name,
            sourceUrl: payload.sourceUrl,
            duration: payload.duration,
            eventCount: payload.eventCount,
            events: payload.events,
            metadata: payload.metadata,
            uploadedAt: new Date().toISOString()
        };

        // Note: The extension sends:
        // name: string
        // sourceUrl: string
        // duration: number
        // eventCount: number
        // events: any[] -- this is actually result.recording from content script

        // Wait, let's look at what the content script returns:
        // return { success: true, recording: capturedRecording }
        // capturedRecording is ClickRecording { version: "2.0", startTime, snapshots }

        // So payload.events is the ClickRecording object.

        await fs.writeFile(filePath, JSON.stringify(recordingData, null, 2), 'utf-8');

        console.log(`[API] Saved recording from extension: ${id}`);

        return NextResponse.json({
            id: id,
            name: payload.name,
            organizationId: "org_default",
            sourceUrl: payload.sourceUrl,
            duration: payload.duration,
            eventCount: payload.eventCount,
            createdAt: new Date().toISOString(),
            createdBy: "user_default"
        }, {
            status: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        console.error('Error saving recording:', error);
        return NextResponse.json(
            { error: 'Failed to save recording' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
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
