import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Conversation } from '../types';

interface AIFusionDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'by-date': number };
  };
  settings: {
    key: string;
    value: {
      apiKeys: Record<string, string>;
      defaultModel: string;
      theme: string;
    };
  };
}

const DB_NAME = 'ai-fusion-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<AIFusionDB> | null = null;

async function getDB(): Promise<IDBPDatabase<AIFusionDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<AIFusionDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('conversations')) {
        const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
        convStore.createIndex('by-date', 'createdAt');
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });
  
  return dbInstance;
}

export async function getConversations(): Promise<Conversation[]> {
  const db = await getDB();
  const conversations = await db.getAllFromIndex('conversations', 'by-date');
  return conversations.reverse();
}

export async function saveConversation(conversation: Conversation): Promise<void> {
  const db = await getDB();
  await db.put('conversations', conversation);
}

export async function deleteConversation(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('conversations', id);
}

export async function clearConversations(): Promise<void> {
  const db = await getDB();
  await db.clear('conversations');
}

interface Settings {
  apiKeys: Record<string, string>;
  defaultModel: string;
  theme: string;
}

const DEFAULT_SETTINGS: Settings = {
  apiKeys: {},
  defaultModel: 'gpt-3.5-turbo',
  theme: 'dark'
};

export async function getSettings(): Promise<Settings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user-settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const db = await getDB();
  const current = await getSettings();
  const merged = { ...current, ...settings, id: 'user-settings' as const };
  await db.put('settings', merged);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('conversations'),
    db.clear('settings')
  ]);
}
