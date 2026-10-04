import * as SecureStore from "expo-secure-store";

export const storageService = {
  /**
   * Check if SecureStore is available on the current device
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await SecureStore.isAvailableAsync();
    } catch {
      return false;
    }
  },

  /**
   * Store a string value securely
   */
  async set(
    key: string,
    value: string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value, options);
      return true;
    } catch (error) {
      console.error(`[storageService] Error setting key "${key}":`, error);
      return false;
    }
  },

  /**
   * Retrieve a stored string value
   */
  async get(
    key: string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key, options);
    } catch (error) {
      console.error(`[storageService] Error getting key "${key}":`, error);
      return null;
    }
  },

  /**
   * Delete a stored item by key
   */
  async remove(
    key: string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key, options);
      return true;
    } catch (error) {
      console.error(`[storageService] Error removing key "${key}":`, error);
      return false;
    }
  },

  /**
   * Check whether a key exists in storage
   */
  async has(
    key: string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<boolean> {
    const value = await this.get(key, options);
    return value !== null;
  },

  /**
   * Remove multiple keys simultaneously
   */
  async multiRemove(
    keys: string[],
    options?: SecureStore.SecureStoreOptions
  ): Promise<void> {
    await Promise.all(keys.map((key) => this.remove(key, options)));
  },

  /**
   * Store an object/array serialized as JSON
   */
  async setJSON<T>(
    key: string,
    value: T,
    options?: SecureStore.SecureStoreOptions
  ): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, options);
    } catch (error) {
      console.error(`[storageService] Error serializing JSON for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Retrieve and deserialize a JSON object/array
   */
  async getJSON<T>(
    key: string,
    options?: SecureStore.SecureStoreOptions
  ): Promise<T | null> {
    try {
      const value = await this.get(key, options);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`[storageService] Error parsing JSON for key "${key}":`, error);
      return null;
    }
  },
};