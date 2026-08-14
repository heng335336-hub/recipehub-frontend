import { useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { SUPPORT_EMAIL } from "../constants";

const emptyForm = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({
    ...emptyForm,
    email: currentUser?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sent, setSent] = useState(false);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Please enter your name.";
    if (!form.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      errs.email = "That email address doesn't look right.";
    }
    if (!form.message.trim()) errs.message = "Please enter a message.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setForm({ ...emptyForm, email: currentUser?.email || "" });
    } catch (err) {
      console.error(err);
      setSubmitError(
        "Couldn't send your message right now. Please try again, or email us directly."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-eyebrow">Get in touch</div>
            <h1>Contact us</h1>
            <p className="lead">
              Questions, feedback, or something not working right? Send us a
              message and we'll get back to you as soon as we can. You might
              also find your answer in the <Link to="/faq">FAQ</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="container contact-grid" style={{ margin: "2.5rem 0" }}>
        <form className="form-card" onSubmit={handleSubmit}>
          <h2>Send a message</h2>

          {submitError && <div className="form-alert">{submitError}</div>}

          {sent && (
            <div className="form-alert form-alert-success">
              Thanks — your message has been sent. We'll reply by email
              soon.
            </div>
          )}

          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={errors.name ? "invalid" : ""}
              autoComplete="name"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
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
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="subject">Subject (optional)</label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              rows={6}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              className={errors.message ? "invalid" : ""}
            />
            {errors.message && (
              <span className="field-error">{errors.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Sending…" : "Send message"}
          </button>
        </form>

        <div className="contact-side">
          <div className="about-card">
            <h3>Email us directly</h3>
            <p>
              Prefer email? Write to us at{" "}
              <a>limkimheng745@gmail.com</a>.
            </p>
          </div>
          <div className="about-card">
            <h3>Response time</h3>
            <p>
              We're a small team, so replies can take a few days. For
              account issues, include the email address on your account.
            </p>
          </div>
          <div className="about-card">
            <h3>Something else?</h3>
            <p>
              For general questions about how RecipeHub works, check the{" "}
              <Link to="/faq">FAQ page</Link> first — it covers most of what
              people ask us.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
