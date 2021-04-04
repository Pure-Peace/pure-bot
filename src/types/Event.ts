export type PlatformType = 'onebot' | 'discord' | 'kaiheila';
export type EventType = 'message' | 'other';
export type Scope =
  | 'private'
  | 'public'
  | 'channel'
  | 'group';
export type EventPath = [Scope, EventType]
