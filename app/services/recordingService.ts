import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL, DEFAULT_ORGANIZATION_ID } from "../utils/config";


export interface BackendRecording {
    id: string;
    name: string;
    organization_id: string;
    source_url: string;
    duration: number;
    event_count: number;
    created_at: string;
    created_by: string;
    thumbnail?: {
        type: number;
        data: {
            x: number;
            y: number;
            target: string;
            snapshot: {
                type: number;
                data: {
                    node: any;
                    initialOffset: any;
                };
            };
        };
        timestamp: number;
    };
    events?: any[];
    metadata?: any;
}

export interface Recording {
    id: string;
    filename: string;
    title: string;
    date: string;
    size: number;
    eventCount: number;
    creator: string;
    thumbnail?: any; // Change to any to handle complex thumbnail objects
}

function transformBackendRecording(data: BackendRecording): Recording {
    // Generate a readable date
    const date = new Date(data.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    return {
        id: data.id,
        filename: data.id, // Backend doesn't use filenames like local fs
        title: data.name,
        date: date,
        size: data.event_count * 1024, // Keep for backward compatibility
        eventCount: data.event_count,
        creator: data.created_by,
        thumbnail: data.thumbnail,
    };
}

export const recordingService = {
    /**
     * Get all recordings for an organization
     */
    async getRecordings(organizationId: string = DEFAULT_ORGANIZATION_ID, limit: number = 100): Promise<Recording[]> {
        const responseData = await fetchJson<BackendRecording[]>(
            `${API_BASE_URL}/recordings?organization_id=${encodeURIComponent(organizationId)}&limit=${limit}`
        );

        return Array.isArray(responseData)
            ? responseData.map(transformBackendRecording)
            : [];
    },

    /**
     * Get a single recording by ID
     */
    async getRecording(recordingId: string, organizationId: string = DEFAULT_ORGANIZATION_ID): Promise<any> {
        return await fetchJson(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`
        );
    },

    /**
     * Update a recording (save annotations, blur regions, hotspots, zoom/pan, etc.)
     * @param recordingId - The demo ID to update
     * @param recording - The recording data with annotations
     * @param organizationId - Organization identifier
     */
    async updateRecording(
        recordingId: string,
        recording: {
            name?: string;
            sourceUrl?: string;
            duration?: number;
            eventCount?: number;
            events?: any[];
            metadata?: any;
            createdBy?: string;
        },
        organizationId: string = DEFAULT_ORGANIZATION_ID
    ): Promise<BackendRecording> {
        return await fetchJson<BackendRecording>(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    name: recording.name,
                    sourceUrl: recording.sourceUrl,
                    duration: recording.duration,
                    eventCount: recording.eventCount,
                    events: recording.events,
                    metadata: recording.metadata,
                    createdBy: recording.createdBy,
                }),
            }
        );
    },

    /**
     * Delete a recording by ID
     */
    async deleteRecording(recordingId: string, organizationId: string = DEFAULT_ORGANIZATION_ID): Promise<void> {
        await fetchWithAuth(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: 'DELETE',
            }
        );
    },

    /**
     * Analyze a recording using backend AI
     */
    async analyzeRecording(recordingId: string, organizationId: string = DEFAULT_ORGANIZATION_ID): Promise<BackendRecording> {
        return await fetchJson<BackendRecording>(
            `${API_BASE_URL}/recordings/${recordingId}/analyze?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: 'POST',
            }
        );
    },

    /**
     * Analyze HTML content with AI to generate metadata
     * @deprecated Use analyzeRecording instead for consistent backend-driven analysis
     */
    async analyze(payload: { html: string, context?: any, type: 'demo_info' | 'step_info' }): Promise<any> {
        // Use relative path for internal API
        // This is an internal API route (Next.js API route), not the backend API
        // So we keep using raw fetch here as it might not be subject to the same auth rules or might be handled differently
        // However, if /api/v1/analyze is protected, the 401 handling in fetchWithAuth handles it gracefully if we used it.
        // Given it's a relative path '/api/v1/analyze', it's likely hitting the Next.js middleware/handler.
        // Let's use fetchJson for consistency but we need to arguably keep it robust.

        // Use fetchJson to get standard error handling
        return await fetchJson(
            '/api/v1/analyze',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );
    }
};
