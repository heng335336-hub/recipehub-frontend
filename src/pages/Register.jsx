import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const emptyForm = { username: "", email: "", password: "", confirmPassword: "" };

export default function Register() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.username.trim() || form.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password)
      errs.confirmPassword = "Passwords do not match.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );

      await updateProfile(cred.user, { displayName: form.username.trim() });

      await setDoc(doc(db, "users", cred.user.uid), {
        username: form.username.trim(),
        email: form.email.trim(),
        createdAt: serverTimestamp(),
      });

      // Fire off the verification email. We don't block sign-up on this -
      // if it fails (rare), the user can still resend it later from the
      // reminder banner.
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.error("Couldn't send verification email:", verifyErr);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setFormError(friendlyAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <form className="form-card" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center" }}>Create your account</h2>

          {formError && <div className="form-alert">{formError}</div>}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={form.username}
              onChange={(e) => updateField("username", e.target.value)}
              className={errors.username ? "invalid" : ""}
              autoComplete="username"
            />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={errors.email ? "invalid" : ""}
              autoComplete="email"
            />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className={errors.password ? "invalid" : ""}
              autoComplete="new-password"
            />
            {errors.password && <div className="field-error">{errors.password}</div>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "invalid" : ""}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Creating account…" : "Register"}
          </button>

          <p className="form-foot">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function friendlyAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with that email already exists.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    default:
      return "Couldn't create your account. Please try again.";
  }
}
