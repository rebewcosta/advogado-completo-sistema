
import { useUserTracking } from "@/hooks/useUserTracking";
import { useGlobalErrorHandler } from "@/hooks/useErrorReporting";

const GlobalHooksProvider = () => {
  useUserTracking();
  useGlobalErrorHandler();
  return null;
};

export default GlobalHooksProvider;
