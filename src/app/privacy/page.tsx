import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Laudica",
  description:
    "Learn how Laudica collects, uses, and protects your personal information. GDPR compliant.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* Title */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: March 2026
          </p>

          <div className="mt-12 space-y-12 text-base leading-relaxed text-muted-foreground">
            {/* Intro */}
            <p>
              Laudica (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
              is the data controller for your personal data and operates the
              Laudica platform, a social proof and testimonial management
              service. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              website, application, and related services, in accordance with the
              General Data Protection Regulation (GDPR) and other applicable
              data protection laws.
            </p>

            {/* 2 — Information We Collect */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Information We Collect
              </h2>
              <p className="mb-3">
                We collect information that you provide directly and information
                generated automatically when you use Laudica:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Account Information
                  </span>{" "}
                  — your name, email address, and password when you create an
                  account. If you sign in via Google OAuth, we receive your
                  name, email, and profile photo from Google.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Testimonial Content
                  </span>{" "}
                  — text, images, ratings, and metadata associated with
                  testimonials you collect, import, or create through the
                  platform.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Analytics &amp; View Counts
                  </span>{" "}
                  — aggregated, non-personal statistics such as embed
                  impressions and wall views. We record the referring URL but
                  do not collect IP addresses, device fingerprints, or any
                  personally identifiable information from embed viewers.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Usage Data
                  </span>{" "}
                  — browser type, operating system, pages visited, and
                  interactions within the app, collected automatically to
                  improve our service.
                </li>
              </ul>
            </section>

            {/* 3 — Legal Bases for Processing */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Legal Bases for Processing
              </h2>
              <p className="mb-3">
                Under the GDPR, we process your personal data on the following
                legal bases:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Contract performance
                  </span>{" "}
                  — processing necessary to provide you with the Laudica
                  service, manage your account, display your testimonials, and
                  fulfill our obligations under our Terms of Service.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Legitimate interest
                  </span>{" "}
                  — processing necessary for our legitimate business interests,
                  including improving the platform, preventing fraud, ensuring
                  security, and generating aggregated analytics. We balance
                  these interests against your rights and freedoms.
                </li>
                <li>
                  <span className="font-medium text-foreground">Consent</span>{" "}
                  — where required, we obtain your explicit consent before
                  processing, such as for optional marketing communications.
                  You may withdraw consent at any time.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Legal obligation
                  </span>{" "}
                  — processing necessary to comply with applicable laws, such
                  as tax and financial reporting requirements.
                </li>
              </ul>
            </section>

            {/* 4 — How We Use Your Information */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                How We Use Your Information
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  To provide, operate, and maintain the Laudica platform.
                </li>
                <li>
                  To authenticate your identity and manage your account.
                </li>
                <li>
                  To generate analytics dashboards and performance metrics for
                  your testimonial walls and embeds.
                </li>
                <li>
                  To communicate with you about service updates, security
                  alerts, and support requests.
                </li>
                <li>
                  To detect, prevent, and address technical issues, fraud, or
                  abuse.
                </li>
                <li>
                  To improve and personalize your experience based on usage
                  patterns.
                </li>
              </ul>
              <p className="mt-3">
                We do not sell your data. We do not serve ads. We do not share
                your information with third parties for marketing purposes.
              </p>
            </section>

            {/* 5 — Data Storage, Security & International Transfers */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Data Storage, Security &amp; International Transfers
              </h2>
              <p>
                Your data is hosted on{" "}
                <span className="font-medium text-foreground">Supabase</span>,
                which runs on AWS infrastructure. Data may be stored and
                processed in data centers located outside the European Economic
                Area (EEA), including in the United States.
              </p>
              <p className="mt-3">
                Where personal data is transferred outside the EEA, we ensure
                appropriate safeguards are in place, including Standard
                Contractual Clauses (SCCs) approved by the European Commission,
                or reliance on the service provider&apos;s participation in
                recognized data transfer frameworks.
              </p>
              <p className="mt-3">
                We use Row Level Security (RLS) policies to ensure that your
                data is accessible only to you and authorized members of your
                team. We implement industry-standard security measures including
                encryption at rest and in transit via TLS, secure authentication
                tokens, and regular security reviews.
              </p>
            </section>

            {/* 6 — Cookies */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Cookies
              </h2>
              <p>
                Laudica uses only{" "}
                <span className="font-medium text-foreground">
                  strictly necessary cookies
                </span>{" "}
                required for authentication and session management. These
                cookies are exempt from consent requirements under the GDPR as
                they are essential for the service to function.
              </p>
              <p className="mt-3">
                We do not use advertising cookies, analytics cookies, or any
                third-party tracking cookies. Our embed widgets do not set any
                cookies on your visitors&apos; browsers.
              </p>
            </section>

            {/* 7 — Third-Party Services (Sub-processors) */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Third-Party Services (Sub-processors)
              </h2>
              <p className="mb-3">
                We use the following sub-processors to operate Laudica. Each
                processes data on our behalf and under our instructions:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Supabase (AWS)
                  </span>{" "}
                  — database hosting, authentication, and file storage. Data
                  may be stored in the US.
                </li>
                <li>
                  <span className="font-medium text-foreground">Vercel</span>{" "}
                  — application hosting and deployment. Edge locations
                  worldwide.
                </li>
                <li>
                  <span className="font-medium text-foreground">Stripe</span>{" "}
                  — payment processing for paid plans. Your payment details are
                  transmitted directly to Stripe and are never stored on our
                  servers. Stripe is certified under PCI DSS Level 1.
                </li>
              </ul>
              <p className="mt-3">
                We maintain Data Processing Agreements (DPAs) with our
                sub-processors that include Standard Contractual Clauses where
                required. Each provider operates under its own privacy policy.
              </p>
            </section>

            {/* 8 — Data Retention */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Data Retention
              </h2>
              <p className="mb-3">
                We retain your personal data only for as long as necessary to
                fulfill the purposes described in this policy:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Account data
                  </span>{" "}
                  — retained for the lifetime of your account.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Testimonial content
                  </span>{" "}
                  — retained until you delete individual testimonials or your
                  project.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Analytics data
                  </span>{" "}
                  — aggregated view counts are retained indefinitely. No
                  personal data is included in analytics.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    After account deletion
                  </span>{" "}
                  — all personal data and testimonial content is permanently
                  deleted within 30 days, except where retention is required
                  by law (e.g., tax records, which may be retained for up to
                  7 years).
                </li>
              </ul>
            </section>

            {/* 9 — Your Rights Under GDPR */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Your Rights Under the GDPR
              </h2>
              <p className="mb-3">
                As a data subject under the GDPR, you have the following rights:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Right of access
                  </span>{" "}
                  — obtain a copy of the personal data we hold about you.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to rectification
                  </span>{" "}
                  — correct inaccurate or incomplete personal data through
                  your account settings or by contacting us.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to erasure
                  </span>{" "}
                  — request deletion of your personal data. You can delete
                  your project or account from the Settings page, or contact
                  us.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to data portability
                  </span>{" "}
                  — receive your data in a structured, commonly used,
                  machine-readable format (CSV or JSON export available from
                  your dashboard).
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to restrict processing
                  </span>{" "}
                  — request that we limit the processing of your personal data
                  in certain circumstances.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to object
                  </span>{" "}
                  — object to processing based on legitimate interest. We will
                  cease processing unless we have compelling legitimate grounds.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Right to withdraw consent
                  </span>{" "}
                  — where processing is based on consent, you may withdraw it
                  at any time without affecting the lawfulness of prior
                  processing.
                </li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:support@laudica.com"
                  className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  support@laudica.com
                </a>
                . We will respond within 30 days as required by the GDPR.
              </p>
              <p className="mt-3">
                You also have the right to lodge a complaint with your local
                Data Protection Authority (DPA) if you believe your data
                protection rights have been violated.
              </p>
            </section>

            {/* 10 — Children's Privacy */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Children&apos;s Privacy
              </h2>
              <p>
                Laudica is not intended for use by individuals under the age
                of 16. We do not knowingly collect personal information from
                children. If we discover that a child under 16 has provided us
                with personal data, we will promptly delete it. If you believe a
                child has provided us with their information, please contact us
                at{" "}
                <a
                  href="mailto:support@laudica.com"
                  className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  support@laudica.com
                </a>
                .
              </p>
            </section>

            {/* 11 — Changes to This Policy */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we
                make material changes, we will notify you by updating the
                &quot;Last updated&quot; date at the top of this page and, where
                appropriate, sending you a notification via email or an in-app
                alert. Your continued use of Laudica after such changes
                constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* 12 — Contact Information */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Contact Information
              </h2>
              <p>
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us:
              </p>
              <p className="mt-3">
                <a
                  href="mailto:support@laudica.com"
                  className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  support@laudica.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
