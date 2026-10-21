import { useEffect } from "react";
import { playUiSound } from "@/lib/sounds";
import { triggerHaptic } from "@/lib/haptics";

/** Play a UI sound and trigger tactile haptic feedback for native buttons and links across the app. */
export function useUiClickSounds() {
  useEffect(() => {
    const onClick = (event) => {
      const el = event.target.closest?.("button, a[href], [role='button']");
      if (!el) return;
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return;
      if (el.dataset.sound === "off") return;
      const soundType = el.dataset.sound || (el.matches("a[href]") ? "navigate" : "tap");
      playUiSound(soundType);
      triggerHaptic(soundType === "navigate" ? "navigate" : "tap");
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
