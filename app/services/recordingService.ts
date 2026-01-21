import { getAuthHeaders } from "../utils/apiAuth";

const API_BASE_URL = "http://localhost:8000/api/v1";
const DEFAULT_ORGANIZATION_ID = "demo-org";

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
    }
};
