import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL as BASE_URL } from "../utils/config";

const API_BASE_URL = `${BASE_URL}/knowledge-base`;



export interface KBDocument {
    id: string;
    organization_id: string;
    filename: string;
    file_type: string | null;
    created_at: string;
    updated_at: string;
    metadata: Record<string, any>;
}

export interface SearchResult {
    content: string;
    metadata: {
        document_id: string;
        filename: string;
        chunk_index: number;
        [key: string]: any;
    };
    distance: number | null;
}

export interface UploadDocumentData {
    organization_id: string;
    filename: string;
    content: string;
    file_type?: string;
}

export interface UploadUrlData {
    url: string;
    organization_id: string;
    metadata?: Record<string, any>;
}

export const knowledgeBaseService = {
    async getDocuments(organizationId: string): Promise<KBDocument[]> {
        return await fetchJson<KBDocument[]>(
            `${API_BASE_URL}/documents?organization_id=${organizationId}`
        );
    },

    async uploadDocument(data: UploadDocumentData): Promise<KBDocument> {
        return await fetchJson<KBDocument>(`${API_BASE_URL}/documents`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async deleteDocument(documentId: string, organizationId: string): Promise<void> {
        await fetchWithAuth(
            `${API_BASE_URL}/documents/${documentId}?organization_id=${organizationId}`,
            {
                method: "DELETE",
            }
        );
    },

    async uploadUrl(data: UploadUrlData): Promise<KBDocument> {
        return await fetchJson<KBDocument>(`${API_BASE_URL}/urls`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    async search(organizationId: string, query: string, limit: number = 5): Promise<{ results: SearchResult[] }> {
        return await fetchJson<{ results: SearchResult[] }>(`${API_BASE_URL}/search`, {
            method: "POST",
            body: JSON.stringify({
                organization_id: organizationId,
                query,
                limit
            }),
        });
    }
};
