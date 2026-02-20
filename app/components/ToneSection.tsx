
import { useState, useEffect } from "react";
import { Mic2, Save, Loader2, Music, Check, RefreshCw } from "lucide-react";
import { toneService, ToneSettings } from "../services/toneService";

const TONE_PRESETS = [
    {
        name: "Professional",
        description: "Use formal language and maintain a professional demeanor in all interactions. Avoid slang, contractions, and casual expressions. Be respectful and courteous."
    },
    {
        name: "Casual",
        description: "Communicate in a friendly, relaxed manner. Use conversational language, contractions, and feel free to be more informal. Keep it natural and approachable."
    },
    {
        name: "Friendly",
        description: "Be warm, approachable, and helpful. Use a friendly tone while remaining professional. Focus on building rapport."
    },
    {
        name: "Technical",
        description: "Use precise technical terminology and industry-standard language. Be detailed and accurate. Assume the user has technical knowledge. Provide specific examples and code snippets when relevant."
    },
    {
        name: "Support",
        description: "Be empathetic and patient. Focus on solving problems step-by-step. Use clear, simple language. Show genuine care for the user's concerns."
    },
    {
        name: "Sales",
        description: "Be enthusiastic and persuasive. Highlight benefits and value propositions. Use positive, action-oriented language. Encourage the user to take next steps."
    }
];

export function ToneSection() {
    const [toneSettings, setToneSettings] = useState<ToneSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [customDescription, setCustomDescription] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchTone();
    }, []);

    const fetchTone = async () => {
        setLoading(true);
        try {
            const data = await toneService.getTone("demo-org");
            setToneSettings(data);
            if (data) {
                setCustomDescription(data.description || "");
                // Check if the current tone matches a preset
                const preset = TONE_PRESETS.find(p => p.name === data.tone);
                if (preset) {
                    setSelectedPreset(preset.name);
                } else {
                    setSelectedPreset("Custom");
                }
            } else {
                // Default to first preset if no tone set
                setSelectedPreset(TONE_PRESETS[0].name);
                setCustomDescription(TONE_PRESETS[0].description);
            }
        } catch (err) {
            console.error("Failed to fetch tone settings", err);
            setMessage({ type: 'error', text: "Failed to load tone settings" });
        } finally {
            setLoading(false);
        }
    };

    const handlePresetChange = (presetName: string) => {
        setSelectedPreset(presetName);
        const preset = TONE_PRESETS.find(p => p.name === presetName);
        if (preset) {
            setCustomDescription(preset.description);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const toneName = selectedPreset === "Custom" ? "Custom Tone" : selectedPreset;

            const updatedTone = await toneService.updateTone({
                organization_id: "demo-org",
                tone: toneName,
                description: customDescription
            });

            setToneSettings(updatedTone);
            setMessage({ type: 'success', text: "Tone settings updated successfully" });

            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Failed to update tone settings" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </section>
        );
    }

    return (
        <section className="premium-surface rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        <Mic2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">Bot Tone & Personality</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-foreground/50 font-medium">
                                Define how your assistant communicates
                            </p>
                            {toneSettings?.version && (
                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/10 font-bold uppercase tracking-wider">
                                    v{toneSettings.version}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Presets Column */}
                <div className="col-span-1 space-y-3">
                    <label className="text-sm font-medium text-foreground block mb-2">
                        Tone Presets
                    </label>
                    <div className="space-y-2">
                        {TONE_PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                onClick={() => handlePresetChange(preset.name)}
                                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 ${selectedPreset === preset.name
                                    ? "bg-primary/10 border-primary shadow-sm text-primary"
                                    : "bg-background border-primary/5 text-foreground/50 hover:border-primary/20 hover:bg-background/80"
                                    }`}
                            >
                                <div className="font-bold text-sm tracking-tight">{preset.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Configuration Column */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                            Tone Description
                        </label>
                        <p className="text-xs text-foreground/50 mb-3">
                            This detailed instruction guides the AI's response style. You can edit this to fine-tune the behavior.
                        </p>
                        <textarea
                            value={customDescription}
                            onChange={(e) => {
                                setCustomDescription(e.target.value);
                                if (!TONE_PRESETS.find(p => p.description === e.target.value)) {
                                    // If edited and doesn't match a preset, strictly we could switch to "Custom", 
                                    // but sticking to the selected preset name is verified behavior in some systems.
                                    // However, usually editing a preset implies it's now a custom variant.
                                    // Let's keep the preset name active but allow free editing.
                                }
                            }}
                            className="w-full h-48 px-4 py-3 bg-background border border-primary/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                            placeholder="Describe how the AI should communicate..."
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.type === 'success' ? <Check className="w-4 h-4" /> : null}
                            {message.text}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-terracotta flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 min-w-[160px] justify-center"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Apply Tone</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
