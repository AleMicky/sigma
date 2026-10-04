import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Linking from "expo-linking";

export const permissionService = {
  /**
   * Request camera permission
   */
  async requestCamera(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestCameraPermissionsAsync();
  },

  /**
   * Get current camera permission status
   */
  async getCameraStatus(): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.getCameraPermissionsAsync();
  },

  /**
   * Check and request camera permission if not granted yet.
   * Returns true if permission is granted.
   */
  async ensureCameraPermission(): Promise<boolean> {
    const status = await this.getCameraStatus();
    if (status.granted) {
      return true;
    }
    if (status.canAskAgain) {
      const requested = await this.requestCamera();
      return requested.granted;
    }
    return false;
  },

  /**
   * Request media library / photo gallery permission
   */
  async requestMediaLibrary(
    writeOnly: boolean = false
  ): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.requestMediaLibraryPermissionsAsync(writeOnly);
  },

  /**
   * Get current media library permission status
   */
  async getMediaLibraryStatus(
    writeOnly: boolean = false
  ): Promise<ImagePicker.PermissionResponse> {
    return ImagePicker.getMediaLibraryPermissionsAsync(writeOnly);
  },

  /**
   * Check and request media library permission if not granted yet.
   * Returns true if permission is granted.
   */
  async ensureMediaLibraryPermission(
    writeOnly: boolean = false
  ): Promise<boolean> {
    const status = await this.getMediaLibraryStatus(writeOnly);
    if (status.granted) {
      return true;
    }
    if (status.canAskAgain) {
      const requested = await this.requestMediaLibrary(writeOnly);
      return requested.granted;
    }
    return false;
  },

  /**
   * Request foreground location permission
   */
  async requestLocation(): Promise<Location.LocationPermissionResponse> {
    return Location.requestForegroundPermissionsAsync();
  },

  /**
   * Get foreground location permission status
   */
  async getLocationStatus(): Promise<Location.LocationPermissionResponse> {
    return Location.getForegroundPermissionsAsync();
  },

  /**
   * Check and request location permission if not granted yet.
   * Returns true if permission is granted.
   */
  async ensureLocationPermission(): Promise<boolean> {
    const status = await this.getLocationStatus();
    if (status.granted) {
      return true;
    }
    if (status.canAskAgain) {
      const requested = await this.requestLocation();
      return requested.granted;
    }
    return false;
  },

  /**
   * Open the application settings screen (useful when user denied permissions permanently)
   */
  async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("[permissionService] Error opening app settings:", error);
    }
  },
};