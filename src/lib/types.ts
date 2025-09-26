

export type Alert = {
  id: string;
  metric: string;
  condition: "above" | "below";
  threshold: number;
  notification: "email" | "sms";
};

export type Key = {
  id_keys: string;
  game: string;
  user_key: string;
  duration: number;
  expired_date: string;
  max_devices: number;
  devices: string | null;
  status: 0 | 1;
  registrator: string;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  level: 1 | 2 | 3 | 4; // 1: Main Admin, 2: Reseller Admin, 3: Reseller, 4: Free User
  saldo: number;
  expiration_date: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramChannelId?: string;
  uplink?: string;
  createdBy?: string; // ID of the Reseller Admin who created this user
  created_at?: string;
  updated_at?: string;
  status?: number;
  ip?: string; // IP address for free users
};

export type UserKeyCount = Pick<User, 'id' | 'username' | 'email' | 'level' | 'saldo' | 'status' | 'uplink'> & {
  keyCount: number;
};

export type FeatureSettings = {
  id: number;
  ESP: 'on' | 'off';
  Item: 'on' | 'off';
  SilentAim: 'on'
  | 'off';
  AIM: 'on' | 'off';
  BulletTrack: 'on' | 'off';
  Memory: 'on' | 'off';
  Floating: 'on' | 'off';
  Setting: 'on' | 'off';
};

export type MaintenanceSettings = {
    id: number;
    status: 'on' | 'off';
    myinput: string;
};

export type ModNameSettings = {
    id: number;
    modname: string;
};

export type FTextSettings = {
    id: number;
    _status: string;
    _ftext: string;
};

export type ReferralCode = {
    id_reff: string;
    code: string;
    Referral: string;
    level: number;
    set_saldo: number;
    used_by: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    acc_expiration: string;
};

export type LibFile = {
  id: number;
  file: string;
  file_type: string;
  file_size: string;
  time: string;
};

export type OnlineBypassSettings = {
    id: number;
    bypass_text: string;
    password: string;
    updated_at: string;
};

export type AnnouncementSettings = {
    id: number;
    text: string;
    updated_at: string;
};

export type SecuritySettings = {
    id: number;
    defense_mode: 'on' | 'off';
    defense_message: string;
};

export type FreeReferralSettings = {
    id: number;
    enabled: 'on' | 'off';
    lock_message: string;
};

export type ApiSettings = {
    id: number;
    api_enabled: 'on' | 'off';
    shortener_enabled: 'on' | 'off';
    shortener_api_key: string;
}

export type EncryptedApiSettings = {
    id: number;
    key: string; // AES-256 key, 64 hex characters (32 bytes)
    iv: string;  // IV, 32 hex characters (16 bytes)
}

export type FkaiSettings = {
    id: number;
    api_enabled: 'on' | 'off';
    shortener_enabled: 'on' | 'off';
    shortener_api_key: string;
};

export type Permissions = {
  [key: string]: boolean;
};

export type KeyPriceTier = {
  id: string; // duration in days, e.g., "7" or "30"
  days: number;
  price: number;
};

export type KeyPriceSettings = {
  defaultPricePerDay: number;
  tiers: Record<string, Omit<KeyPriceTier, 'id'>>; // Record of tiers, keyed by duration
};
