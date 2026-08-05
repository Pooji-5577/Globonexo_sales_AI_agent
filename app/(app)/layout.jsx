import AppShell from "../../components/layout/AppShell";
import { SetupProvider } from "../../providers/SetupProvider";
import TourOverlay from "../../components/tour/TourOverlay";
import SetupCopilot from "../../components/setup/SetupCopilot";

export const metadata = {
  title: "GNX sales",
};

export default function AppLayout({ children }) {
  return (
    <SetupProvider>
      <AppShell>{children}</AppShell>
      <TourOverlay />
      <SetupCopilot />
    </SetupProvider>
  );
}
