export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold text-primary mb-6">
                    Dashboard
                </h1>
                <p className="text-foreground mb-4">
                    Analytics view with mock data (Views, Engagement, Hotspots).
                </p>
                {/* TODO: Add analytics cards and campaigns list */}
            </div>
        </div>
    );
}
