import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Path to the nexbit-recordings folder in Downloads
const RECORDINGS_DIR = path.join(os.homedir(), 'Downloads', 'nexbit-recordings');

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const demoDataStr = formData.get('demoData') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Ensure the directory exists
        try {
            await fs.access(RECORDINGS_DIR);
        } catch {
            await fs.mkdir(RECORDINGS_DIR, { recursive: true });
        }

        // Parse demo data if provided, otherwise parse the file
        let demoData: Record<string, unknown> & { id?: string; filename?: string };
        if (demoDataStr) {
            demoData = JSON.parse(demoDataStr) as Record<string, unknown> & { id?: string; filename?: string };
        } else {
            const fileContent = await file.text();
            demoData = JSON.parse(fileContent) as Record<string, unknown> & { id?: string; filename?: string };
        }

        // Validate demo data structure
        if (!demoData.id && !demoData.filename) {
            // Generate a unique ID if not provided
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            demoData.id = `recording-${timestamp}.json`;
        }

        // Generate filename if not provided
        const filename = demoData.filename || demoData.id || file.name;
        const sanitizedFilename = path.basename(filename);

        // Ensure .json extension
        const finalFilename = sanitizedFilename.endsWith('.json')
            ? sanitizedFilename
            : `${sanitizedFilename}.json`;

        const filePath = path.join(RECORDINGS_DIR, finalFilename);

        // Check if file already exists
        try {
            await fs.access(filePath);
            // File exists, add timestamp to make it unique
            const timestamp = Date.now();
            const nameWithoutExt = finalFilename.replace('.json', '');
            const newFilename = `${nameWithoutExt}-${timestamp}.json`;
            const newFilePath = path.join(RECORDINGS_DIR, newFilename);
            await fs.writeFile(newFilePath, JSON.stringify(demoData, null, 2), 'utf-8');

            return NextResponse.json({
                success: true,
                id: newFilename,
                message: 'Demo imported successfully (renamed to avoid conflict)'
            });
        } catch {
            // File doesn't exist, proceed with import
            await fs.writeFile(filePath, JSON.stringify(demoData, null, 2), 'utf-8');

            console.log(`[API] Imported demo: ${finalFilename}`);

            return NextResponse.json({
                success: true,
                id: finalFilename,
                message: 'Demo imported successfully'
            });
        }
    } catch (error) {
        console.error('Error importing demo:', error);

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON file format' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to import demo' },
            { status: 500 }
        );
    }
}
