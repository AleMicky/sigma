import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { ApiError } from "@/api/api-error";
import { authService } from "@/features/auth/services/auth.service";
import type {
  AuthTokenResponse,
  LoginPayload,
} from "@/features/auth/types/auth.types";

export function useLogin(
  options?: UseMutationOptions<AuthTokenResponse, ApiError, LoginPayload>
) {
  return useMutation<AuthTokenResponse, ApiError, LoginPayload>({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    ...options,
  });
}