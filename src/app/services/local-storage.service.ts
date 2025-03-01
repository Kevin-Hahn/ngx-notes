import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  /**
   * Save data to local storage
   * @param key The key to store the data under
   * @param data The data to store
   */
  saveData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  }
  
  /**
   * Get data from local storage
   * @param key The key to retrieve data from
   * @returns The data if found, null otherwise
   */
  getData<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting data from localStorage', error);
      return null;
    }
  }
  
  /**
   * Remove data from local storage
   * @param key The key to remove
   */
  removeData(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from localStorage', error);
    }
  }
  
  /**
   * Clear all data from local storage
   */
  clearAllData(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  }
}