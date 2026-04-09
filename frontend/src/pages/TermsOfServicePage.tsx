import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const TermsOfServicePage = () => (
  <motion.div
    className="min-h-screen bg-background text-foreground px-6 py-10 max-w-3xl mx-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Effective date: 09 April 2026</p>
      <Link to="/" className="mt-4 inline-block text-xs text-primary underline">Back to home</Link>
    </header>

    <section className="space-y-4 text-sm leading-relaxed">
      <p>
        1. Service Description
        <br />
        This site is a student-made portfolio demo that showcases a wrap-style academic summary experience with mock data.
      </p>
      <p>
        2. Eligibility and Use
        <br />
        Use the published demo credentials only. Do not enter real personal or institutional passwords.
      </p>
      <p>
        3. Data Handling
        <br />
        Data displayed in this public version is mock/demo content. No production academic backend is connected.
      </p>
      <p>
        4. No Guarantees or Warranties
        <br />
        The service is provided “as is” without warranties of accuracy, completeness, or fitness for any academic or official purpose. Grades and summaries may not reflect official records.
      </p>
      <p>
        5. Limitations on Liability
        <br />
        Under no circumstances shall the provider be liable for any damages, losses, or decisions you make based on information provided by this service.
      </p>
      <p>
        6. Acceptable Use
        <br />
        You agree not to:
        <br />
        Reverse engineer, overload, or abuse the service.
        <br />
        Attempt unauthorized access or impersonation.
        <br />
        Use the service for commercial redistribution, resale, or public redistribution.
      </p>
      <p>
        7. Intellectual Property
        <br />
        All code, design, branding, and content of this website belong to the creator. No part may be distributed or reused commercially without permission.
      </p>
      <p>
        8. Termination
        <br />
        The provider reserves the right to suspend or discontinue the service at any time without notice.
      </p>
      <p>
        9. Governing Law / Jurisdiction
        <br />
        These terms are interpreted under general international principles for educational tools and personal projects. Disputes shall be resolved under reasonable legal frameworks applicable.
      </p>
      <p>
        10. Contact &amp; Support
        <br />
        For inquiries, requests, or complaints please reach support@buewrap.com
      </p>
      <p>
        11. Acceptance of Terms
        <br />
        By using this demo you acknowledge that you have read and agree to this Privacy Policy and Terms of Service.
      </p>
      <p>
        12. Note from the Provider
        <br />
        I am open to further inquiries or actions regarding anything that does not satisfy the university’s policies. If necessary, I will kindly shut down the website upon request. You may contact me at support@buewrap.com for any such matters.
      </p>
    </section>
  </motion.div>
);

export default TermsOfServicePage;
