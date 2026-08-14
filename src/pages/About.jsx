import { Link } from "react-router-dom";

const VALUES = [
  {
    title: "Real recipes, real people",
    body: "Every recipe on RecipeHub is submitted by someone who actually cooked it — not scraped from somewhere else on the internet.",
  },
  {
    title: "Simple by design",
    body: "No pop-ups, no fifteen-paragraph life stories before the ingredient list. Just the recipe, the steps, and a photo.",
  },
  {
    title: "Open to everyone",
    body: "Browsing and searching recipes is free for guests. Create a free account when you're ready to save favorites or publish your own.",
  },
];

const STEPS = [
  {
    title: "Browse or search",
    body: "Explore recipes by category or search for something specific — no account needed.",
  },
  {
    title: "Create a free account",
    body: "Register with your email to unlock saving, rating, and commenting on recipes.",
  },
  {
    title: "Share your own",
    body: "Add your recipe with a photo, ingredients, and step-by-step instructions in a few minutes.",
  },
];

export default function About() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-eyebrow">About RecipeHub</div>
            <h1>A simple place to cook from.</h1>
            <p className="lead">
              RecipeHub is a community-built recipe box. We started it as a
              student project with one goal: make it easy to find a recipe
              you'll actually cook tonight, and just as easy to share your
              own with everyone else.
            </p>
            <div className="hero-cta">
              <Link to="/recipes" className="btn btn-primary">
                Browse recipes
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">Why RecipeHub</div>
            <h2>What we care about</h2>
          </div>
        </div>
        <div className="about-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="about-card">
              <h3>{v.title}</h3>
              <p>{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ marginTop: "3rem" }}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">Getting started</div>
            <h2>How it works</h2>
          </div>
        </div>
        <div className="about-steps">
          {STEPS.map((s, i) => (
            <div key={s.title} className="about-step">
              <span className="about-step-num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ margin: "3rem 0" }}>
        <div className="state-block" style={{ background: "var(--color-bg-alt)" }}>
          <h3>Questions?</h3>
          <p>
            Check our <Link to="/faq">FAQ</Link> or{" "}
            <Link to="/contact">contact us</Link> — we'd love to hear from
            you.
          </p>
        </div>
      </section>
    </div>
  );
}
