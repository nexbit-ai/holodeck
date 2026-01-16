import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Path to the holodeck-recordings folder in Downloads
const RECORDINGS_DIR = path.join(os.homedir(), 'Downloads', 'holodeck-recordings');

export interface Recording {
    id: string;
    filename: string;
    title: string;
    date: string;
    size: number;
    creator: string;
    thumbnail?: {
        html: string;
        viewportWidth: number;
        viewportHeight: number;
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    try {
        // Ensure the directory exists
        try {
            await fs.access(RECORDINGS_DIR);
        } catch {
            // Directory doesn't exist, create it
            await fs.mkdir(RECORDINGS_DIR, { recursive: true });
            if (id) {
                return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
            }
            return NextResponse.json({ recordings: [] });
        }

        // If an ID is provided, return the file content
        if (id) {
            // Sanitize the filename to prevent directory traversal
            const sanitizedId = path.basename(id);
            const filePath = path.join(RECORDINGS_DIR, sanitizedId);

            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(content);
                return NextResponse.json({
                    id: sanitizedId,
                    content: data
                });
            } catch {
                return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
            }
        }

        // Otherwise, list all recordings
        const files = await fs.readdir(RECORDINGS_DIR);

        // Filter for JSON files and get their stats
        const recordings: Recording[] = await Promise.all(
            files
                .filter((file) => file.endsWith('.json'))
                .map(async (filename) => {
                    const filePath = path.join(RECORDINGS_DIR, filename);
                    const stats = await fs.stat(filePath);

                    // Parse date from filename (format: recording-2026-01-16T02-30-45-123Z.json)
                    let date = stats.mtime.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    });

                    // Try to extract date from filename
                    const dateMatch = filename.match(/recording-(\d{4}-\d{2}-\d{2})/);
                    if (dateMatch) {
                        const parsedDate = new Date(dateMatch[1]);
                        if (!isNaN(parsedDate.getTime())) {
                            date = parsedDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            });
                        }
                    }

                    // Generate a readable title from the filename
                    const title = filename
                        .replace('.json', '')
                        .replace(/recording-/, 'Recording ')
                        .replace(/T\d{2}-\d{2}-\d{2}.*/, '');

                    // Read file content for thumbnail
                    let thumbnail: Recording['thumbnail'] = undefined;
                    try {
                        const content = await fs.readFile(filePath, 'utf-8');
                        const data = JSON.parse(content);
                        // Check if it's a v2.0 click recording with snapshots
                        if (data.version === '2.0' && data.snapshots && data.snapshots.length > 0) {
                            const firstSnapshot = data.snapshots[0];
                            thumbnail = {
                                html: firstSnapshot.html,
                                viewportWidth: firstSnapshot.viewportWidth || 1920,
                                viewportHeight: firstSnapshot.viewportHeight || 1080,
                            };
                        }
                    } catch {
                        // If we can't read the file, just skip thumbnail
                    }

                    return {
                        id: filename,
                        filename,
                        title,
                        date,
                        size: stats.size,
                        creator: 'Local Recording',
                        thumbnail,
                    };
                })
        );

        // Sort by date (newest first)
        recordings.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json({ recordings });
    } catch (error) {
        console.error('Error reading recordings:', error);
        return NextResponse.json(
            { error: 'Failed to read recordings', recordings: [] },
            { status: 500 }
        );
    }
}

// PUT endpoint to update a recording (save annotations)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, content } = body;

        if (!id || !content) {
            return NextResponse.json(
                { error: 'Missing id or content' },
                { status: 400 }
            );
        }

        // Sanitize the filename to prevent directory traversal
        const sanitizedId = path.basename(id);
        const filePath = path.join(RECORDINGS_DIR, sanitizedId);

        // Verify the file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json(
                { error: 'Recording not found' },
                { status: 404 }
            );
        }

        // Write the updated content
        await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');

        console.log(`[API] Saved recording: ${sanitizedId}`);

        return NextResponse.json({
            success: true,
            id: sanitizedId,
            message: 'Recording saved successfully'
        });
    } catch (error) {
        console.error('Error saving recording:', error);
        return NextResponse.json(
            { error: 'Failed to save recording' },
            { status: 500 }
        );
    }
}
