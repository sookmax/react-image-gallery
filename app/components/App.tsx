import { AppState } from "../store";
import ClientEntryPoint from "./ClientEntryPoint";

export default function App({
  initialState,
}: {
  initialState?: Partial<AppState>;
}) {
  return (
    <div data-id="server-root">
      <div data-id="client-root">
        <ClientEntryPoint initialState={initialState} />
      </div>
    </div>
  );
}
