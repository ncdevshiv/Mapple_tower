import { UserProfile } from '../types';
import { AuthService } from './AuthService';

const STORAGE_KEY = 'clash_defense_profile_v1';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const DEFAULT_PROFILE: UserProfile = {
  gems: 0,
  unlockedTechs: {}
};

export class PersistenceManager {
  private profile: UserProfile;

  constructor() {
    this.profile = this.load();
  }

  public load(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load save', e);
    }
    return { ...DEFAULT_PROFILE };
  }

  public async save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));

      // Cloud Sync
      if (AuthService.isAuthenticated()) {
        const token = AuthService.getToken();
        await fetch(`${API_URL}/saves/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.profile)
        }).catch(err => console.warn('Cloud sync failed', err));
      }
    } catch (e) {
      console.warn('Failed to save', e);
    }
  }

  public getProfile(): UserProfile {
    return this.profile;
  }

  public addGems(amount: number) {
    this.profile.gems += amount;
    this.save();
  }

  public spendGems(amount: number): boolean {
    if (this.profile.gems >= amount) {
      this.profile.gems -= amount;
      this.save();
      return true;
    }
    return false;
  }

  public unlockTech(techId: string) {
    if (!this.profile.unlockedTechs[techId]) {
      this.profile.unlockedTechs[techId] = 0;
    }
    this.profile.unlockedTechs[techId]++;
    this.save();
  }

  public getTechLevel(techId: string): number {
    return this.profile.unlockedTechs[techId] || 0;
  }
}
