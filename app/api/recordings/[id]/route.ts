import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Path to the holodeck-recordings folder in Downloads
const RECORDINGS_DIR = path.join(os.homedir(), 'Downloads', 'holodeck-recordings');

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        // Handle both Promise and direct params (Next.js 13+ compatibility)
        const resolvedParams = params instanceof Promise ? await params : params;
        const id = decodeURIComponent(resolvedParams.id);

        console.log(`[API] Delete request for ID: ${id}`);

        if (!id) {
            return NextResponse.json(
                { error: 'Demo ID is required' },
                { status: 400 }
            );
        }

        // Ensure the directory exists
        try {
            await fs.access(RECORDINGS_DIR);
        } catch {
            return NextResponse.json(
                { error: 'Recordings directory not found' },
                { status: 404 }
            );
        }

        // Sanitize the filename to prevent directory traversal
        // The ID should be the filename, so we use it directly
        let sanitizedId = path.basename(id);
        
        // Remove any query parameters or fragments that might have been added
        sanitizedId = sanitizedId.split('?')[0].split('#')[0];
        
        // Ensure it ends with .json
        if (!sanitizedId.endsWith('.json')) {
            sanitizedId = `${sanitizedId}.json`;
        }
        
        const filePath = path.join(RECORDINGS_DIR, sanitizedId);

        console.log(`[API] Looking for file at: ${filePath}`);
        console.log(`[API] Sanitized ID: ${sanitizedId}`);

        // Check if file exists
        try {
            await fs.access(filePath);
            // File exists, delete it
            await fs.unlink(filePath);
            console.log(`[API] Deleted demo: ${sanitizedId}`);
            return NextResponse.json({
                success: true,
                message: 'Demo deleted successfully'
            });
        } catch (err) {
            // File not found at exact path, try to find it by listing directory
            try {
                const files = await fs.readdir(RECORDINGS_DIR);
                console.log(`[API] Available files in directory:`, files);
                console.log(`[API] Looking for: ${sanitizedId} (from ID: ${id})`);
                
                // Try exact match first, then case-insensitive match
                let matchingFile = files.find(f => f === sanitizedId || f === id);
                
                if (!matchingFile) {
                    // Try case-insensitive match
                    matchingFile = files.find(f => 
                        f.toLowerCase() === sanitizedId.toLowerCase() || 
                        f.toLowerCase() === id.toLowerCase()
                    );
                }
                
                if (matchingFile) {
                    const actualFilePath = path.join(RECORDINGS_DIR, matchingFile);
                    await fs.unlink(actualFilePath);
                    console.log(`[API] Deleted demo (found by matching): ${matchingFile}`);
                    return NextResponse.json({
                        success: true,
                        message: 'Demo deleted successfully'
                    });
                }
            } catch (listErr) {
                console.error('[API] Error listing files:', listErr);
            }
            
            return NextResponse.json(
                { 
                    error: 'Demo not found',
                    details: `File "${sanitizedId}" not found in recordings directory. Received ID: "${id}"`
                },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error deleting demo:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete demo' },
            { status: 500 }
        );
    }
}
