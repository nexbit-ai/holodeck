import { getAuthHeaders } from "../utils/apiAuth";
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
        const response = await fetch(
            `${API_BASE_URL}/recordings?organization_id=${encodeURIComponent(organizationId)}&limit=${limit}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch recordings: ${response.statusText}`);
        }

        const responseData = await response.json();
        return Array.isArray(responseData)
            ? responseData.map(transformBackendRecording)
            : [];
    },

    /**
     * Get a single recording by ID
     */
    async getRecording(recordingId: string, organizationId: string = DEFAULT_ORGANIZATION_ID): Promise<any> {
        const response = await fetch(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch recording: ${response.statusText}`);
        }

        return await response.json();
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
        const response = await fetch(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: 'PUT',
                headers: getAuthHeaders(),
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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to update recording: ${response.statusText}`);
        }

        return await response.json();
    },

    /**
     * Delete a recording by ID
     */
    async deleteRecording(recordingId: string, organizationId: string = DEFAULT_ORGANIZATION_ID): Promise<void> {
        const response = await fetch(
            `${API_BASE_URL}/recordings/${recordingId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: 'DELETE',
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to delete recording: ${response.statusText}`);
        }
    },

    /**
     * Analyze HTML content with AI to generate metadata
     */
    async analyze(payload: { html: string, context?: any, type: 'demo_info' | 'step_info' }): Promise<any> {
        // Use relative path for internal API
        const response = await fetch('/api/v1/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `AI Analysis failed: ${response.statusText}`);
        }

        return await response.json();
    }
};
