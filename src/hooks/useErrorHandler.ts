import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface UseErrorHandlerReturn {
  error: Error | null;
  isError: boolean;
  handleError: (error: Error | string) => void;
  clearError: () => void;
  retryAction: (action: () => Promise<void> | void) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { t } = useTranslation("responses");
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setError(errorObj);
    
    // Show user-friendly error messages
    const userMessage = getUserFriendlyMessage(errorObj.message, t);
    toast.error(userMessage);
    
    // Log to console for debugging
    console.error('Error handled:', errorObj);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryAction = useCallback(async (action: () => Promise<void> | void) => {
    try {
      clearError();
      await action();
      toast.success(t("action_completed_successfully"));
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(t("unknown_error_occurred")));
    }
  }, [handleError, clearError]);

  return {
    error,
    isError: error !== null,
    handleError,
    clearError,
    retryAction
  };
};

const getUserFriendlyMessage = (errorMessage: string, t = (key: string) => key): string => {
  // Map technical errors to user-friendly Arabic messages
  const errorMap: Record<string, string> = {
    'Network Error': t("network_error") || 'مشكلة في الاتصال بالإنترنت',
    'Unauthorized': t("unauthorized") || 'يجب تسجيل الدخول أولاً',
    'Forbidden': t("forbidden") || 'ليس لديك صلاحية للقيام بهذا الإجراء',
    'Not Found': t("not_found") || 'المحتوى المطلوب غير موجود',
    'Internal Server Error': t("internal_server_error") || 'خطأ في الخادم، يرجى المحاولة لاحقاً',
    'Bad Request': t("bad_request") || 'البيانات المدخلة غير صحيحة',
    'Timeout': t("timeout") || 'انتهت مهلة الاتصال',
    'Invalid email': t("invalid_email") || 'البريد الإلكتروني غير صحيح',
    'Invalid password': t("invalid_password") || 'كلمة المرور غير صحيحة',
    'Email already exists': t("email_exists_error") || 'البريد الإلكتروني مستخدم بالفعل'
  };

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default message for unknown errors
  return t("unknown_error_occurred") || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
};