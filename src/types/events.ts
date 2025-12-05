// =====================================================
// EVENT SYSTEM TYPES
// Comprehensive type definitions for the event system
// =====================================================

export type EventStatus = 'inactive' | 'active' | 'completed' | 'expired';

export type EventType = 'blasters2' | 'seasonal' | 'special' | 'collaboration';

export type RewardType = 
  | 'points' 
  | 'background' 
  | 'badge' 
  | 'frame' 
  | 'title' 
  | 'music' 
  | 'yokai'
  | 'avatar_item';

export interface EventReward {
  id: string;
  type: RewardType;
  item_id?: string;
  amount?: number;
  name: Record<string, string>; // Multi-language names
  description: Record<string, string>; // Multi-language descriptions
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export interface EventMilestone {
  id: string;
  progress_required: number;
  rewards: EventReward[];
  name: Record<string, string>;
  description: Record<string, string>;
  is_final?: boolean;
}

export interface EventConfiguration {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  type: EventType;
  status: EventStatus;
  
  // Progress configuration
  total_progress_required: number;
  progress_unit: string; // e.g., "Yo-kai discovered", "battles won"
  
  // Game configuration
  game_mode: 'infinite' | 'daily' | 'special';
  yokai_filter?: string[]; // Array of Yo-kai IDs to include/exclude
  filter_mode: 'include' | 'exclude'; // Whether to include only these Yo-kai or exclude them
  
  // Visual configuration
  theme_color: string;
  background_image?: string;
  icon: string;
  
  // Milestones and rewards
  milestones: EventMilestone[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PlayerEventProgress {
  id: string;
  player_id: string;
  event_id: string;
  current_progress: number;
  completed_milestones: string[]; // Array of milestone IDs
  claimed_rewards: string[]; // Array of reward IDs
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  last_activity: string;
}

export interface EventGameSession {
  event_id: string;
  session_start: string;
  yokai_guessed: string[];
  correct_guesses: number;
  total_attempts: number;
  session_progress: number;
}

// Event system configuration
export interface EventSystemConfig {
  max_active_events: number;
  allow_concurrent_events: boolean;
  progress_save_interval: number; // milliseconds
  session_timeout: number; // milliseconds
}

// Event analytics and statistics
export interface EventAnalytics {
  event_id: string;
  total_participants: number;
  completion_rate: number;
  average_completion_time: number;
  most_difficult_milestone: string;
  popular_rewards: EventReward[];
  daily_participation: Record<string, number>;
}

// Event notification types
export interface EventNotification {
  id: string;
  event_id: string;
  player_id: string;
  type: 'milestone_reached' | 'reward_earned' | 'event_started' | 'event_ending';
  title: Record<string, string>;
  message: Record<string, string>;
  data?: any;
  read: boolean;
  created_at: string;
}

// Event leaderboard entry
export interface EventLeaderboardEntry {
  player_id: string;
  player_name: string;
  progress: number;
  completion_time?: number;
  rank: number;
  rewards_earned: number;
}

// Event validation rules
export interface EventValidationRules {
  min_progress_per_session: number;
  max_progress_per_session: number;
  cooldown_between_sessions: number;
  require_authentication: boolean;
  min_player_level?: number;
}

// Helper types for event management
export type EventFilter = {
  status?: EventStatus[];
  type?: EventType[];
  active_only?: boolean;
};

export type EventSortBy = 'created_at' | 'updated_at' | 'name' | 'progress_required' | 'participants';

export type EventSortOrder = 'asc' | 'desc';

// Event creation/update payload
export interface CreateEventPayload {
  name: Record<string, string>;
  description: Record<string, string>;
  type: EventType;
  total_progress_required: number;
  progress_unit: string;
  game_mode: 'infinite' | 'daily' | 'special';
  yokai_filter?: string[];
  filter_mode: 'include' | 'exclude';
  theme_color: string;
  background_image?: string;
  icon: string;
  milestones: Omit<EventMilestone, 'id'>[];
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  status?: EventStatus;
}

// Event system hooks return types
export interface UseEventSystemReturn {
  events: EventConfiguration[];
  activeEvents: EventConfiguration[];
  playerProgress: Record<string, PlayerEventProgress>;
  loading: boolean;
  error: string | null;
  
  // Event management
  createEvent: (payload: CreateEventPayload) => Promise<EventConfiguration>;
  updateEvent: (id: string, payload: UpdateEventPayload) => Promise<EventConfiguration>;
  deleteEvent: (id: string) => Promise<void>;
  activateEvent: (id: string) => Promise<void>;
  deactivateEvent: (id: string) => Promise<void>;
  
  // Player progress
  getPlayerProgress: (eventId: string) => PlayerEventProgress | null;
  updateProgress: (eventId: string, progress: number) => Promise<void>;
  claimReward: (eventId: string, rewardId: string) => Promise<void>;
  
  // Utility functions
  canParticipate: (eventId: string) => boolean;
  getNextMilestone: (eventId: string) => EventMilestone | null;
  getEventAnalytics: (eventId: string) => Promise<EventAnalytics>;
}

// Event game mode specific types
export interface EventGameModeConfig {
  event_id: string;
  yokai_pool: string[];
  difficulty_scaling: boolean;
  time_limits?: {
    per_guess: number;
    per_session: number;
  };
  special_rules?: {
    hints_available: boolean;
    skip_allowed: boolean;
    bonus_multipliers: boolean;
  };
}

// Event reward distribution tracking
export interface RewardDistribution {
  reward_id: string;
  event_id: string;
  total_distributed: number;
  unique_recipients: number;
  distribution_rate: number;
  first_claimed_at: string;
  last_claimed_at: string;
}
