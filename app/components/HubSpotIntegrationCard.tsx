
import { useState, useEffect } from "react";
import { Link2, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { hubspotService, HubSpotIntegration } from "../services/hubspotService";

interface HubSpotIntegrationCardProps {
    className?: string;
}

export function HubSpotIntegrationCard({ className }: HubSpotIntegrationCardProps) {
    const [status, setStatus] = useState<HubSpotIntegration | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

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

    const handleDisconnect = () => {
        setShowDisconnectConfirm(true);
    };

    const handleConfirmDisconnect = async () => {
        setShowDisconnectConfirm(false);
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
            <div className={`bg-surface rounded-2xl p-6 shadow-sm border border-primary/5 flex items-center justify-center h-full min-h-[200px] ${className}`}>
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className={`bg-surface rounded-2xl p-6 shadow-sm border ${isConnected ? "border-green-500/20" : "border-primary/5"} hover:shadow-lg hover:border-primary/10 transition-all flex flex-col h-full relative ${className}`}>
            {error && (
                <div className="absolute top-2 right-2 text-xs text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}

            {/* Logo and Name */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF7A59" />
                        <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#FF7A59" />
                    </svg>
                </div>
                <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">HubSpot</h3>
                        {isConnected && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Connected
                            </span>
                        )}
                    </div>
                    {isConnected ? (
                        <button
                            onClick={handleDisconnect}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-surface border border-primary/20 text-primary px-4 py-2 rounded-xl font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50 text-sm"
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={actionLoading}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                            Connect
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/70 mb-4 flex-1">
                Collect, send and sync engagement and lead data from Nexbit to HubSpot.
            </p>

            {/* Footer */}
            <div className="flex items-center pt-4 border-t border-primary/5">
                <span className="text-xs font-medium text-foreground/50 bg-primary/5 px-3 py-1 rounded-full">
                    CRM
                </span>
            </div>

            {/* Connected Status Details */}
            {isConnected && status?.hubspot_account_id && (
                <div className="mt-4 pt-4 border-t border-primary/5 text-xs text-foreground/50 flex gap-4">
                    <span>Account ID: {status.hubspot_account_id}</span>
                    <span>Hub ID: {status.hubspot_hub_id}</span>
                </div>
            )}

            {/* Disconnect Confirmation Modal */}
            {showDisconnectConfirm && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
                    onClick={() => setShowDisconnectConfirm(false)}
                >
                    <div
                        className="bg-surface border border-primary/10 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-primary/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-foreground">Disconnect HubSpot</h3>
                                <p className="text-xs text-foreground/50">Confirm disconnection</p>
                            </div>
                            <button
                                onClick={() => setShowDisconnectConfirm(false)}
                                className="p-2 hover:bg-primary/5 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground/40" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-foreground mb-1">Are you sure?</h4>
                                    <p className="text-sm text-foreground/60">
                                        Disconnecting HubSpot will stop syncing leads and analytics data. You can reconnect at any time.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 border-t border-primary/5 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDisconnectConfirm(false)}
                                className="px-6 py-2.5 border border-primary/10 text-foreground rounded-xl font-medium hover:bg-primary/5 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDisconnect}
                                disabled={actionLoading}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Disconnecting...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-4 h-4" />
                                        Disconnect
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
