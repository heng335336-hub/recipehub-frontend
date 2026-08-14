import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "Is RecipeHub free to use?",
    a: "Yes. Browsing and searching recipes is free and doesn't require an account. Creating a free account adds the ability to save favorites, rate and comment on recipes, and publish your own.",
  },
  {
    q: "Do I need an account to view recipes?",
    a: "No — anyone can browse and search the full recipe collection as a guest. You'll only be asked to log in when you try to add a recipe, save a favorite, or leave a comment.",
  },
  {
    q: "How do I add my own recipe?",
    a: "Register for a free account, then click \"Add Recipe\" in the navigation bar. You'll be asked for a title, description, category, cooking time, servings, an ingredient list, step-by-step instructions, and an optional photo.",
  },
  {
    q: "Can I edit or delete a recipe after publishing it?",
    a: "Yes. Recipes can only be edited or deleted by the account that published them — you can manage yours from your Profile page.",
  },
  {
    q: "Why does a recipe I added show a placeholder or unrelated photo?",
    a: "If you don't upload your own photo, we try to fill in a stand-in image automatically. Occasionally that automatic match doesn't look quite right — you can always replace it by editing your recipe and uploading your own picture.",
  },
  {
    q: "How do ratings and comments work?",
    a: "Signed-in users can leave a star rating and a comment on any recipe. This is meant to help other cooks know what worked (or didn't) when they made it.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: "From the Login page, use the password reset option to get a reset link sent to your email address.",
  },
  {
    q: "How do I get in touch about something not covered here?",
    a: "Head over to our Contact page and send us a message — we read every one.",
  },
];

export default function FAQ() {
  return (
    <div className="page">
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-eyebrow">Help center</div>
            <h1>Frequently asked questions</h1>
            <p className="lead">
              Answers to the questions we hear most. Can't find what you're
              looking for? <Link to="/contact">Reach out to us directly</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="container" style={{ margin: "2.5rem 0" }}>
        <div className="faq-list">
          {FAQS.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div
          className="state-block"
          style={{ background: "var(--color-bg-alt)", marginTop: "2rem" }}
        >
          <h3>Still have a question?</h3>
          <p>
            We're happy to help. <Link to="/contact">Send us a message</Link>{" "}
            and we'll get back to you.
          </p>
        </div>
      </section>
    </div>
  );
}
