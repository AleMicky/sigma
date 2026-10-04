import { useState } from "react";

import { permissionService } from "@/services/permission.service";

export function usePermissions() {
  const [loading, setLoading] =
    useState(false);

  const requestCamera = async () => {
    try {
      setLoading(true);

      return await permissionService.requestCamera();
    } finally {
      setLoading(false);
    }
  };

  const requestMediaLibrary = async () => {
    try {
      setLoading(true);

      return await permissionService.requestMediaLibrary();
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      setLoading(true);

      return await permissionService.requestLocation();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requestCamera,
    requestMediaLibrary,
    requestLocation,
  };
}