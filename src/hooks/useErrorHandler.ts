import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseErrorHandlerReturn {
  error: Error | null;
  isError: boolean;
  handleError: (error: Error | string) => void;
  clearError: () => void;
  retryAction: (action: () => Promise<void> | void) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error);
    setError(errorObj);
    
    // Show user-friendly error messages
    const userMessage = getUserFriendlyMessage(errorObj.message);
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
      toast.success('تم بنجاح!');
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('حدث خطأ غير متوقع'));
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

const getUserFriendlyMessage = (errorMessage: string): string => {
  // Map technical errors to user-friendly Arabic messages
  const errorMap: Record<string, string> = {
    'Network Error': 'مشكلة في الاتصال بالإنترنت',
    'Unauthorized': 'يجب تسجيل الدخول أولاً',
    'Forbidden': 'ليس لديك صلاحية للقيام بهذا الإجراء',
    'Not Found': 'المحتوى المطلوب غير موجود',
    'Internal Server Error': 'خطأ في الخادم، يرجى المحاولة لاحقاً',
    'Bad Request': 'البيانات المدخلة غير صحيحة',
    'Timeout': 'انتهت مهلة الاتصال',
    'Invalid email': 'البريد الإلكتروني غير صحيح',
    'Invalid password': 'كلمة المرور غير صحيحة',
    'Email already exists': 'البريد الإلكتروني مستخدم بالفعل'
  };

  // Check for partial matches
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Default message for unknown errors
  return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
};