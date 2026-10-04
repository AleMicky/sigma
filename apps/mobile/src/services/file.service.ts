import * as DocumentPicker from "expo-document-picker";

export interface PickedFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
  file?: File;
}

export interface PickFileOptions {
  type?: string | string[];
  copyToCacheDirectory?: boolean;
}

export const fileService = {
  /**
   * Pick a single file from device storage.
   * Accepts either an options object or a type string/array for backwards compatibility.
   */
  async pick(
    optionsOrType: PickFileOptions | string | string[] = "*/*"
  ): Promise<PickedFile | null> {
    const options: DocumentPicker.DocumentPickerOptions =
      typeof optionsOrType === "string" || Array.isArray(optionsOrType)
        ? { type: optionsOrType, multiple: false, copyToCacheDirectory: true }
        : {
            type: optionsOrType.type ?? "*/*",
            multiple: false,
            copyToCacheDirectory: optionsOrType.copyToCacheDirectory ?? true,
          };

    try {
      const result = await DocumentPicker.getDocumentAsync(options);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const file = result.assets[0];

      return {
        uri: file.uri,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        file: file.file,
      };
    } catch (error) {
      console.error("[fileService] Error picking document:", error);
      return null;
    }
  },

  /**
   * Pick multiple files from device storage.
   */
  async pickMultiple(options: PickFileOptions = {}): Promise<PickedFile[]> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: options.type ?? "*/*",
        multiple: true,
        copyToCacheDirectory: options.copyToCacheDirectory ?? true,
      });

      if (result.canceled || !result.assets) {
        return [];
      }

      return result.assets.map((file) => ({
        uri: file.uri,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        file: file.file,
      }));
    } catch (error) {
      console.error("[fileService] Error picking multiple documents:", error);
      return [];
    }
  },

  /**
   * Format bytes into a human-readable string (B, KB, MB, GB)
   */
  formatSize(bytes?: number, decimals = 1): string {
    if (!bytes || bytes <= 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB", "TB"];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const unitIndex = Math.min(i, units.length - 1);

    if (unitIndex === 0) {
      return `${bytes} B`;
    }

    const value = (bytes / Math.pow(k, unitIndex)).toFixed(decimals);
    return `${value} ${units[unitIndex]}`;
  },

  /**
   * Validate if file size does not exceed the maximum allowed limit
   */
  validateFileSize(bytes?: number, maxBytes?: number): boolean {
    if (!bytes || !maxBytes) return true;
    return bytes <= maxBytes;
  },

  /**
   * Extract file extension from a file name or URI
   */
  getFileExtension(fileNameOrUri: string): string {
    const cleanPath = fileNameOrUri.split("?")[0];
    const parts = cleanPath.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
  },
};