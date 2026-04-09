import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PrivacyPolicyPage = () => (
  <motion.div
    className="min-h-screen bg-background text-foreground px-6 py-10 max-w-3xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Effective date: 09 April 2026</p>
      <p className="text-sm text-muted-foreground">Contact: support@buewrap.com</p>
      <Link to="/" className="mt-4 inline-block text-xs text-primary underline">Back to home</Link>
    </header>

    <section className="space-y-4 text-sm leading-relaxed">
      <p>
        1. Data Collection and Processing
        <br />
        This public repository runs in portfolio demo mode. It does not connect to any real university portal or external academic source. The app uses built-in mock data to render the wrap experience.
      </p>
      <p>
        2. Data Storage
        <br />
        No personal credentials are required. Demo session tokens are stored only in your browser session storage to keep you logged in during the current tab session.
      </p>
      <p>
        3. Third‑Party Tools &amp; Tracking
        <br />
        The app does not include analytics trackers, ad profiling, or backend user databases in this demo setup.
      </p>
      <p>
        4. Data Use and Sharing
        <br />
        Share links encode demo wrap data into the URL token for convenience. Do not use share links for any private or sensitive information.
      </p>
      <p>
        5. User Rights
        <br />
        Because this demo does not maintain personal user records on a server, there are no account-level deletion workflows.
      </p>
      <p>
        6. Responsibility and Liability
        <br />
        Demo content is illustrative only and may not represent real academic records.
      </p>
      <p>
        7. Minors
        <br />
        The service is intended for students who have lawful consent for use. Users under 18 should have supervision or parental consent.
      </p>
      <p>
        8. Changes to Policy
        <br />
        This policy may be updated as the portfolio project evolves. Continued use implies acceptance of the latest version.
      </p>
    </section>
  </motion.div>
);

export default PrivacyPolicyPage;
