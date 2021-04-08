/**
 * TODO: change type to 'string'
 */
export type PlatformType = 'onebot' | 'discord' | 'kaiheila';
/**
 * TODO: add more event types
 */
export type EventType = 'message' | 'other';
/**
 * |Scope|description|
 * |-----|-----------|
 * |private| private chat|
 * |public| any scope that is publicly viewable by third person (incl. private channel. e.g. #match in osu irc chat)|
 * |channel| joinable public scope|
 * |group| for onebot|
 * |default| if no scope is provided, 'default' will be assigned|
 */
export type Scope =
  | 'private'
  | 'public'
  | 'channel'
  | 'group'
  | 'default';
