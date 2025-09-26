

import { AppLayout } from "@/components/app-layout";
import { ServerSettingsClient } from "./components/server-settings-client";
import { 
  getFeatureSettings, 
  getMaintenanceSettings, 
  getModNameSettings, 
  getFTextSettings,
  getAnnouncementSettings,
  getSecuritySettings,
  getFreeReferralSettings,
  createInitialSettings,
} from "./actions";
import { FTextSettings, FeatureSettings, MaintenanceSettings, ModNameSettings, AnnouncementSettings, SecuritySettings, FreeReferralSettings } from "@/lib/types";

// Default values in case fetching fails or data doesn't exist
const defaultFeatures: FeatureSettings = {
    id: 1, ESP: 'off', Item: 'off', SilentAim: 'off', AIM: 'off',
    BulletTrack: 'off', Memory: 'off', Floating: 'off', Setting: 'off'
};
const defaultMaintenance: MaintenanceSettings = { id: 1, status: 'off', myinput: '' };
const defaultModName: ModNameSettings = { id: 1, modname: '' };
const defaultFText: FTextSettings = { id: 1, _status: '', _ftext: '' };
const defaultAnnouncement: AnnouncementSettings = { id: 1, text: '', updated_at: '' };
const defaultSecurity: SecuritySettings = { id: 1, defense_mode: 'off', defense_message: 'DDoS protection, hard client production' };
const defaultFreeReferral: FreeReferralSettings = { id: 1, enabled: 'off', lock_message: 'Your free trial has expired. Please make a payment to continue.' };


export default async function ServerSettingsPage() {
  
  // Ensure the initial records exist in Firebase
  await createInitialSettings();
  
  // Fetch all settings in parallel
  const [
    features, 
    maintenance, 
    modName, 
    fText,
    announcement,
    security,
    freeReferral,
  ] = await Promise.all([
    getFeatureSettings(),
    getMaintenanceSettings(),
    getModNameSettings(),
    getFTextSettings(),
    getAnnouncementSettings(),
    getSecuritySettings(),
    getFreeReferralSettings(),
  ]);


  return (
    <AppLayout>
      <ServerSettingsClient 
        initialFeatures={features ?? defaultFeatures}
        initialMaintenance={maintenance ?? defaultMaintenance}
        initialModName={modName ?? defaultModName}
        initialFText={fText ?? defaultFText}
        initialAnnouncement={announcement ?? defaultAnnouncement}
        initialSecurity={security ?? defaultSecurity}
        initialFreeReferral={freeReferral ?? defaultFreeReferral}
      />
    </AppLayout>
  );
}
