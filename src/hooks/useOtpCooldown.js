import { useState, useEffect } from 'react';

/**
 * React Hook for Progressive Exponential OTP Cooldown Timer
 * @returns {{ cooldown: number, canResend: boolean, triggerCooldown: (seconds: number) => void, resetCooldown: () => void }}
 */
export const useOtpCooldown = () => {
  const [cooldown, setCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (cooldown <= 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const triggerCooldown = (seconds = 10) => {
    const sec = Math.max(0, Number(seconds) || 10);
    setCooldown(sec);
    setCanResend(false);
  };

  const resetCooldown = () => {
    setCooldown(0);
    setCanResend(true);
  };

  return { cooldown, canResend, triggerCooldown, resetCooldown };
};

export default useOtpCooldown;
