import { useAppUpdate } from "@/hooks/useAppUpdate";
import { UpdateToast } from "./UpdateToast";

const AppUpdater = () => {
  const {
    needRefresh,
    reload,
    dismiss,
  } = useAppUpdate();

  if (!needRefresh) {
    return null;
  }

  return (
    <UpdateToast
      onUpdate={reload}
      onDismiss={dismiss}
    />
  );
};

export default AppUpdater;