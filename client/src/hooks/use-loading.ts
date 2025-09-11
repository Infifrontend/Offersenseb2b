
import { useLoading } from "@/contexts/LoadingContext";

export { useLoading };

// Example usage hook for API calls
export function useLoadingWrapper() {
  const { showLoader, hideLoader } = useLoading();

  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      showLoader();
      const result = await asyncFn();
      return result;
    } finally {
      hideLoader();
    }
  };

  return { withLoading, showLoader, hideLoader };
}
