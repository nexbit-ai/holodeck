
import { useState, useEffect } from "react";
import { Link2, Hexagon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { hubspotService, HubSpotIntegration } from "../services/hubspotService";

interface HubSpotIntegrationCardProps {
    className?: string;
}

export function HubSpotIntegrationCard({ className }: HubSpotIntegrationCardProps) {
    const [status, setStatus] = useState<HubSpotIntegration | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ORGANIZATION_ID = "demo-org";
    // In a real app, this should be an env var or constructed dynamically
    const REDIRECT_URI = typeof window !== "undefined" ? `${window.location.origin}/integrations` : "";

    useEffect(() => {
        checkStatus();
    }, []);

    // Check for authorization code in URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            handleCallback(code);
        }
    }, []);

    const checkStatus = async () => {
        try {
            const data = await hubspotService.getIntegrationStatus(ORGANIZATION_ID);
            setStatus(data);
        } catch (err: any) {
            // 404 means not connected, which is fine
            if (err.message !== "Integration not found") {
                console.error("Failed to check HubSpot status", err);
            }
            setStatus(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCallback = async (code: string) => {
        setActionLoading(true);
        // Clear code from URL to prevent re-submission
        window.history.replaceState({}, document.title, window.location.pathname);

        try {
            const data = await hubspotService.exchangeCode(code, ORGANIZATION_ID);
            setStatus(data);
            setError(null);
        } catch (err: any) {
            console.error("Failed to exchange code", err);
            setError("Failed to connect HubSpot. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConnect = async () => {
        setActionLoading(true);
        setError(null);
        try {
            const { authorization_url } = await hubspotService.getAuthUrl(ORGANIZATION_ID, REDIRECT_URI);
            window.location.href = authorization_url;
        } catch (err: any) {
            console.error("Failed to get auth URL", err);
            setError("Failed to initiate connection. Please try again.");
            setActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm("Are you sure you want to disconnect HubSpot?")) return;

        setActionLoading(true);
        try {
            await hubspotService.disconnectIntegration(ORGANIZATION_ID);
            setStatus(null);
            setError(null);
        } catch (err: any) {
            console.error("Failed to disconnect", err);
            setError("Failed to disconnect HubSpot.");
        } finally {
            setActionLoading(false);
        }
    };

    const isConnected = status?.is_active;

    if (loading) {
        return (
            <div className={`bg-surface rounded-lg p-6 shadow-sm border border-primary/5 ${className}`}>
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-surface rounded-lg p-6 shadow-sm border ${isConnected ? "border-green-500/20" : "border-primary/5"} hover:shadow-md transition-shadow relative ${className}`}>
            {error && (
                <div className="absolute top-2 right-2 text-xs text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-[#FF7A59]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hexagon className="w-6 h-6 text-[#FF7A59]" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-foreground">HubSpot</h3>
                            {isConnected && (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Connected
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-foreground/70 mb-4">
                            Create new leads and sync demo analytics data as custom contact properties directly to your CRM.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-sm text-primary hover:underline">
                                Learn more
                            </a>
                            {isConnected ? (
                                <button
                                    onClick={handleDisconnect}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-surface border border-red-200 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                    Disconnect
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnect}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 bg-[#FF7A59] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#FF7A59]/90 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                    Connect
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isConnected && status?.hubspot_account_id && (
                <div className="mt-4 pt-4 border-t border-primary/5 text-xs text-foreground/50 flex gap-4">
                    <span>Account ID: {status.hubspot_account_id}</span>
                    <span>Hub ID: {status.hubspot_hub_id}</span>
                </div>
            )}
        </div>
    );
}
