import { useState } from 'react';

interface UseLoadingStateOptions {
  initialLoading?: boolean;
}

export const useLoadingState = ({ initialLoading = false }: UseLoadingStateOptions = {}) => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const startLoading = (message?: string) => {
    setIsLoading(true);
    if (message) {
      setLoadingMessage(message);
    }
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const withLoading = async <T>(
    asyncFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    startLoading(message);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    withLoading,
  };
};

// Hook for combining multiple loading states
export const useCombinedLoadingState = (...loadingStates: boolean[]) => {
  return loadingStates.some(state => state);
};

// Hook for managing form submission loading
export const useFormLoading = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');

  const startSubmitting = (message = 'Submitting...') => {
    setIsSubmitting(true);
    setSubmitMessage(message);
  };

  const stopSubmitting = () => {
    setIsSubmitting(false);
    setSubmitMessage('');
  };

  const withSubmission = async <T>(
    submitFn: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    startSubmitting(message);
    try {
      const result = await submitFn();
      return result;
    } finally {
      stopSubmitting();
    }
  };

  return {
    isSubmitting,
    submitMessage,
    startSubmitting,
    stopSubmitting,
    withSubmission,
  };
};
