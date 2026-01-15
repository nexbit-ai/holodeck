export default function ViewerPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex h-screen">
                {/* Left Split: Product Simulation */}
                <div className="flex-1 border-r border-gray-200 p-4">
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        Product View
                    </h2>
                    <p className="text-foreground">
                        Placeholder for recorded product iframe/container.
                    </p>
                    {/* TODO: Add product simulation container */}
                </div>

                {/* Right Split: Chat Interface */}
                <div className="w-96 p-4 bg-surface">
                    <h2 className="text-xl font-bold text-primary mb-4">
                        Chat Interface
                    </h2>
                    <p className="text-foreground">
                        Interactive chat with hardcoded happy paths.
                    </p>
                    {/* TODO: Add chat interface */}
                </div>
            </div>
        </div>
    );
}
