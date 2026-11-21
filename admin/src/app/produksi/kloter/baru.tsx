import { router, Stack } from "expo-router";
import { FormKloter } from "@/components/FormKloter";
import { Layar } from "@/components/Layar";

export default function KloterBaru() {
  return (
    <Layar>
      <Stack.Screen options={{ title: "Kloter baru" }} />
      <FormKloter selesai={(id) => router.replace({ pathname: "/produksi/kloter/[id]", params: { id } })} />
    </Layar>
  );
}
