
const API_BASE_URL = "http://localhost:8000/api/v1/knowledge-base";

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

export const knowledgeBaseService = {
    async getDocuments(organizationId: string): Promise<KBDocument[]> {
        const response = await fetch(`${API_BASE_URL}/documents?organization_id=${organizationId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }

        return response.json();
    },

    async uploadDocument(data: UploadDocumentData): Promise<KBDocument> {
        const response = await fetch(`${API_BASE_URL}/documents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to upload document: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteDocument(documentId: string, organizationId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}?organization_id=${organizationId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to delete document: ${response.statusText}`);
        }
    },

    async search(organizationId: string, query: string, limit: number = 5): Promise<{ results: SearchResult[] }> {
        const response = await fetch(`${API_BASE_URL}/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                organization_id: organizationId,
                query,
                limit
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to search knowledge base: ${response.statusText}`);
        }

        return response.json();
    }
};
