import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const RESEND_COOLDOWN_MS = 30000;

export default function EmailVerificationBanner() {
  const { currentUser, emailVerified, refreshEmailVerified } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [status, setStatus] = useState(""); // "sending" | "sent" | "error" | ""
  const [cooldownUntil, setCooldownUntil] = useState(0);

  if (!currentUser || emailVerified || dismissed) return null;

  const onCooldown = Date.now() < cooldownUntil;

  async function handleResend() {
    if (onCooldown) return;
    setStatus("sending");
    try {
      await sendEmailVerification(currentUser);
      setStatus("sent");
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  async function handleCheckAgain() {
    const verified = await refreshEmailVerified();
    if (!verified) setStatus("still-unverified");
  }

  return (
    <div className="verify-banner">
      <div className="container verify-banner-inner">
        <span>
          📩 Please verify your email ({currentUser.email}) — check your
          inbox for a link from Firebase.
          {status === "sent" && " New link sent!"}
          {status === "error" && " Couldn't send the email — try again shortly."}
          {status === "still-unverified" && " Not verified yet — check your inbox."}
        </span>
        <div className="verify-banner-actions">
          <button
            className="btn btn-secondary"
            onClick={handleResend}
            disabled={status === "sending" || onCooldown}
          >
            {onCooldown ? "Resent — wait a bit" : "Resend email"}
          </button>
          <button className="btn btn-secondary" onClick={handleCheckAgain}>
            I verified it
          </button>
          <button
            className="verify-banner-close"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
