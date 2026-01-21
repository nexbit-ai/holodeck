import { NextRequest, NextResponse } from "next/server";

/**
 * Stytch Webhook Handler
 * This endpoint receives webhooks from Stytch for events like user creation, organization updates, etc.
 * 
 * To configure:
 * 1. Go to Stytch Dashboard > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/stytch/webhook
 * 3. Select events you want to listen to
 * 4. Copy the webhook secret and add it to NEXT_PUBLIC_STYTCH_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const webhookSecret = request.headers.get("stytch-webhook-secret");
        const expectedSecret = process.env.NEXT_PUBLIC_STYTCH_WEBHOOK_SECRET;

        // Verify webhook secret
        if (webhookSecret !== expectedSecret) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Handle different webhook event types
        const eventType = body.type;

        switch (eventType) {
            case "user.created":
                // Handle new user creation
                console.log("User created:", body.data);
                break;
            case "user.deleted":
                // Handle user deletion
                console.log("User deleted:", body.data);
                break;
            case "organization.created":
                // Handle organization creation
                console.log("Organization created:", body.data);
                break;
            case "organization.member.added":
                // Handle member added to organization
                console.log("Member added:", body.data);
                break;
            default:
                console.log("Unhandled webhook event:", eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
