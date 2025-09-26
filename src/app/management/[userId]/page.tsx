
import { AppLayout } from "@/components/app-layout";
import { getUser, getManagedKeys, getReferralCodesByCreator, getSubResellers } from "./actions";
import { UserDetailsClient } from "./components/user-details-client";
import { notFound } from "next/navigation";
import { ReferralCode, User } from "@/lib/types";

export default async function UserDetailsPage({ params }: { params: { userId: string }}) {
    const { userId } = params;

    const user = await getUser(userId);
    
    if (!user) {
        notFound();
    }

    // Fetch all data in parallel
    const [keys, referralCodes, subResellers] = await Promise.all([
        getManagedKeys(user),
        user.level === 2 ? getReferralCodesByCreator(user.username) : Promise.resolve([]),
        user.level === 2 ? getSubResellers(user.username) : Promise.resolve([])
    ]);

    return (
        <AppLayout>
            <UserDetailsClient 
                user={user} 
                initialKeys={keys}
                initialReferrals={referralCodes}
                initialSubResellers={subResellers}
            />
        </AppLayout>
    )
}
