/**
 * Cloud Sync Manager
 * Handles syncing localStorage data to cloud for authenticated users
 */

// Keys to sync to the cloud
export const SYNC_KEYS = [
    'medalliumFavorites',
    'medalliumUnlockDates',
    'medalliumViewMode',
    'yokaidleGameState',
    'yokaidle_achievements',
    'yokaidle_circles',
    'yokaidle_daily_state',
    'yokaidle_economy',
    'yokaidle_hints_state',
    'yokaidle_infinite_stat',
    'yokaidle_last_version_seen',
    'yokaidle_medallium',
    'yokaidle_transactions'
] as const;

const SYNC_STATUS_KEY = 'yokaidle_cloud_sync_status';
const SESSION_ID_KEY = 'yokaidle_session_id';

export interface SyncStatus {
    isSynced: boolean;
    lastSyncedAt: string | null;
    userId: string | null;
}

export interface CloudData {
    [key: string]: any;
}

export interface CloudDataStats {
    yokaiUnlocked: number;
    achievementsCount: number;
    totalPoints: number;
    gamesPlayed: number;
    lastSyncedAt: string | null;
}

export interface CrossDeviceCheckResult {
    needsSync: boolean;
    reason: 'different_session' | 'data_mismatch' | null;
    cloudSessionId: string | null;
    localSessionId: string | null;
    lastSynced: string | null;
}

/**
 * Get the current sync status from localStorage
 */
export function getSyncStatus(): SyncStatus {
    if (typeof window === 'undefined') {
        return { isSynced: false, lastSyncedAt: null, userId: null };
    }

    try {
        const saved = localStorage.getItem(SYNC_STATUS_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('[CloudSync] Error loading sync status:', error);
    }

    return { isSynced: false, lastSyncedAt: null, userId: null };
}

/**
 * Mark the user as synced
 */
export function markAsSynced(userId: string): void {
    if (typeof window === 'undefined') return;

    const status: SyncStatus = {
        isSynced: true,
        lastSyncedAt: new Date().toISOString(),
        userId
    };

    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
}

/**
 * Clear sync status (used when user logs out or wants to resync)
 */
export function clearSyncStatus(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SYNC_STATUS_KEY);
}

/**
 * Get all localStorage data that should be synced
 */
export function getLocalData(): CloudData {
    if (typeof window === 'undefined') return {};

    const data: CloudData = {};

    for (const key of SYNC_KEYS) {
        try {
            const value = localStorage.getItem(key);
            if (value !== null) {
                // Try to parse as JSON, fall back to string
                try {
                    data[key] = JSON.parse(value);
                } catch {
                    data[key] = value;
                }
            }
        } catch (error) {
            console.error(`[CloudSync] Error reading ${key}:`, error);
        }
    }

    return data;
}

/**
 * Apply cloud data to localStorage
 */
export function applyCloudData(cloudData: CloudData): void {
    if (typeof window === 'undefined') return;

    for (const [key, value] of Object.entries(cloudData)) {
        try {
            if (SYNC_KEYS.includes(key as any)) {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, stringValue);
            }
        } catch (error) {
            console.error(`[CloudSync] Error applying ${key}:`, error);
        }
    }
}

/**
 * Upload local data to cloud
 */
export async function uploadToCloud(userId: string): Promise<boolean> {
    try {
        const localData = getLocalData();
        const sessionId = getSessionId();

        const response = await fetch('/api/cloud-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, data: localData, sessionId })
        });

        if (!response.ok) {
            console.error('[CloudSync] Upload failed:', await response.text());
            return false;
        }

        markAsSynced(userId);
        console.log('[CloudSync] Data uploaded successfully');
        return true;
    } catch (error) {
        console.error('[CloudSync] Upload error:', error);
        return false;
    }
}

/**
 * Download cloud data and apply to localStorage
 */
export async function downloadFromCloud(userId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/cloud-sync?userId=${userId}`);

        if (!response.ok) {
            console.error('[CloudSync] Download failed:', await response.text());
            return false;
        }

        const result = await response.json();

        if (result.data) {
            applyCloudData(result.data);
            markAsSynced(userId);
            console.log('[CloudSync] Data downloaded and applied successfully');
            return true;
        }

        return false;
    } catch (error) {
        console.error('[CloudSync] Download error:', error);
        return false;
    }
}

/**
 * Fetch cloud data without applying it (for preview)
 */
export async function fetchCloudData(userId: string): Promise<{ data: CloudData | null; lastSynced: string | null; hasCloudData: boolean }> {
    try {
        const response = await fetch(`/api/cloud-sync?userId=${userId}`);

        if (!response.ok) {
            return { data: null, lastSynced: null, hasCloudData: false };
        }

        const result = await response.json();
        return {
            data: result.data,
            lastSynced: result.lastSynced,
            hasCloudData: result.hasCloudData
        };
    } catch (error) {
        console.error('[CloudSync] Fetch error:', error);
        return { data: null, lastSynced: null, hasCloudData: false };
    }
}

/**
 * Get stats from cloud data for display
 */
export function getCloudDataStats(data: CloudData | null): CloudDataStats {
    if (!data) {
        return {
            yokaiUnlocked: 0,
            achievementsCount: 0,
            totalPoints: 0,
            gamesPlayed: 0,
            lastSyncedAt: null
        };
    }

    let yokaiUnlocked = 0;
    let achievementsCount = 0;
    let totalPoints = 0;
    let gamesPlayed = 0;

    // Count medallium entries
    if (data.yokaidle_medallium) {
        const medallium = data.yokaidle_medallium;
        yokaiUnlocked = Object.keys(medallium.collected || medallium || {}).length;
    }

    // Count achievements
    if (data.yokaidle_achievements) {
        const achievements = data.yokaidle_achievements;
        achievementsCount = Object.values(achievements).filter((a: any) => a?.unlocked).length;
    }

    // Get total points
    if (data.yokaidle_economy) {
        const economy = data.yokaidle_economy;
        totalPoints = economy.totalEarned || economy.points || 0;
    }

    // Get games played
    if (data.yokaidleGameState) {
        const gameState = data.yokaidleGameState;
        gamesPlayed = (gameState.dailyStats?.totalPlayed || 0) +
            (gameState.infiniteStats?.totalPlayed || 0);
    }

    return {
        yokaiUnlocked,
        achievementsCount,
        totalPoints,
        gamesPlayed,
        lastSyncedAt: null
    };
}

/**
 * Get stats from local data for comparison
 */
export function getLocalDataStats(): CloudDataStats {
    return getCloudDataStats(getLocalData());
}

/**
 * Trigger a background sync (client -> server)
 * Call this after localStorage changes when user is authenticated and synced
 */
let syncDebounceTimer: NodeJS.Timeout | null = null;
let periodicSyncInterval: NodeJS.Timeout | null = null;
let currentUserId: string | null = null;

export function triggerSync(userId?: string): void {
    const effectiveUserId = userId || currentUserId;
    if (!effectiveUserId) return;

    const syncStatus = getSyncStatus();

    // Only sync if user is marked as synced
    if (!syncStatus.isSynced || syncStatus.userId !== effectiveUserId) {
        return;
    }

    // Debounce to avoid too many requests
    if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
    }

    syncDebounceTimer = setTimeout(async () => {
        console.log('[CloudSync] Background sync triggered');
        await uploadToCloud(effectiveUserId);
    }, 2000); // Wait 2 seconds after last change before syncing
}

/**
 * Start periodic sync (every 5 minutes)
 */
export function startPeriodicSync(userId: string): void {
    currentUserId = userId;

    // Clear any existing interval
    if (periodicSyncInterval) {
        clearInterval(periodicSyncInterval);
    }

    // Do an immediate sync on start
    const syncStatus = getSyncStatus();
    if (syncStatus.isSynced && syncStatus.userId === userId) {
        console.log('[CloudSync] Initial sync on app start');
        uploadToCloud(userId);
    }

    // Then sync every 5 minutes
    periodicSyncInterval = setInterval(() => {
        const status = getSyncStatus();
        if (status.isSynced && status.userId === userId) {
            console.log('[CloudSync] Periodic sync triggered');
            uploadToCloud(userId);
        }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('[CloudSync] Periodic sync started (every 5 minutes)');
}

/**
 * Stop periodic sync
 */
export function stopPeriodicSync(): void {
    if (periodicSyncInterval) {
        clearInterval(periodicSyncInterval);
        periodicSyncInterval = null;
    }
    currentUserId = null;
    console.log('[CloudSync] Periodic sync stopped');
}

/**
 * Get current user ID (for use in other modules)
 */
export function getCurrentSyncUserId(): string | null {
    return currentUserId;
}

/**
 * Generate a unique session ID for this browser/device
 */
function generateSessionId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get or create session ID for this browser
 */
export function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
}

/**
 * Check if user played on a different device
 */
export async function checkCrossDeviceSync(userId: string): Promise<CrossDeviceCheckResult> {
    try {
        const localSessionId = getSessionId();
        const syncStatus = getSyncStatus();

        // Only check if user is already synced
        if (!syncStatus.isSynced) {
            return {
                needsSync: false,
                reason: null,
                cloudSessionId: null,
                localSessionId,
                lastSynced: null
            };
        }

        const response = await fetch(`/api/cloud-sync?userId=${userId}`);
        if (!response.ok) {
            return {
                needsSync: false,
                reason: null,
                cloudSessionId: null,
                localSessionId,
                lastSynced: null
            };
        }

        const result = await response.json();

        // No cloud data
        if (!result.hasCloudData) {
            return {
                needsSync: false,
                reason: null,
                cloudSessionId: null,
                localSessionId,
                lastSynced: null
            };
        }

        const cloudSessionId = result.sessionId;

        // Check if session is different
        if (cloudSessionId && cloudSessionId !== localSessionId) {
            console.log('[CloudSync] Different session detected:', {
                cloudSessionId,
                localSessionId
            });
            return {
                needsSync: true,
                reason: 'different_session',
                cloudSessionId,
                localSessionId,
                lastSynced: result.lastSynced
            };
        }

        return {
            needsSync: false,
            reason: null,
            cloudSessionId,
            localSessionId,
            lastSynced: result.lastSynced
        };
    } catch (error) {
        console.error('[CloudSync] Cross-device check error:', error);
        return {
            needsSync: false,
            reason: null,
            cloudSessionId: null,
            localSessionId: getSessionId(),
            lastSynced: null
        };
    }
}
