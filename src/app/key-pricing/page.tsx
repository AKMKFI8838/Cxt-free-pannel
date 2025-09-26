
import { AppLayout } from "@/components/app-layout";
import { KeyPricingClient } from "./components/key-pricing-client";
import { getKeyPriceSettings, createInitialKeyPriceSettings } from "./actions";

export default async function KeyPricingPage() {
    await createInitialKeyPriceSettings();
    const settings = await getKeyPriceSettings();
    
    return (
        <AppLayout>
             <div className="space-y-4 md:space-y-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Key Pricing
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Set the cost for generating keys based on their duration.
                    </p>
                </div>
                <KeyPricingClient initialSettings={settings} />
            </div>
        </AppLayout>
    )
}
