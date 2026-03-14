import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms of Service | Laudica",
  description:
    "Terms of Service for Laudica — the social proof engine for modern SaaS. GDPR compliant.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* Page header */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: March 2026
          </p>

          {/* Body */}
          <div className="mt-12 space-y-10 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {/* 1 — Acceptance of Terms */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Laudica ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you do not agree
                to all of these Terms, you may not access or use the Service. We
                may update these Terms from time to time, and your continued use
                of the Service after any changes constitutes your acceptance of
                the revised Terms.
              </p>
            </section>

            {/* 2 — Description of Service */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                2. Description of Service
              </h2>
              <p>
                Laudica is a social proof and testimonial management platform
                that enables businesses to:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  Collect testimonials and reviews from customers via
                  customizable collection forms.
                </li>
                <li>
                  Manage and organize testimonial content within a centralized
                  dashboard.
                </li>
                <li>
                  Build visually rich showcase walls using a variety of layout
                  styles.
                </li>
                <li>
                  Embed testimonial walls on external websites via generated
                  embed codes.
                </li>
                <li>
                  Analyze testimonial performance through built-in analytics.
                </li>
              </ul>
            </section>

            {/* 3 — Account Registration & Responsibilities */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                3. Account Registration &amp; Responsibilities
              </h2>
              <p>
                To use certain features of the Service, you must register for an
                account. When you register, you agree to:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  Provide accurate, current, and complete information during
                  registration.
                </li>
                <li>
                  Maintain and promptly update your account information to keep
                  it accurate.
                </li>
                <li>
                  Keep your password secure and confidential. You are responsible
                  for all activity that occurs under your account.
                </li>
                <li>
                  Notify Laudica immediately of any unauthorized use of your
                  account.
                </li>
              </ul>
              <p className="mt-3">
                Laudica reserves the right to suspend or terminate accounts
                that violate these Terms or that have been inactive for an
                extended period.
              </p>
            </section>

            {/* — Data Protection & GDPR */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                4. Data Protection &amp; GDPR Compliance
              </h2>
              <p>
                Laudica processes personal data in accordance with the General
                Data Protection Regulation (GDPR) and applicable EU data
                protection laws. Our full data processing practices are
                described in our{" "}
                <a
                  href="/privacy"
                  className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  Privacy Policy
                </a>
                .
              </p>
              <p className="mt-3">
                When you use Laudica to collect testimonials from your
                customers (e.g., via collection forms), you act as a data
                controller for that personal data, and Laudica acts as a data
                processor on your behalf. You are responsible for:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  Ensuring you have a lawful basis to collect and display
                  testimonials from your customers.
                </li>
                <li>
                  Obtaining any necessary consent from individuals whose
                  testimonials you collect and publish.
                </li>
                <li>
                  Responding to data subject requests from your customers
                  regarding their testimonial data.
                </li>
              </ul>
              <p className="mt-3">
                For Business plan users processing personal data at scale,
                Laudica provides a Data Processing Agreement (DPA) upon
                request. Contact{" "}
                <a
                  href="mailto:support@laudica.com"
                  className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                >
                  support@laudica.com
                </a>{" "}
                to request a DPA.
              </p>
            </section>

            {/* — Free and Paid Plans */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                5. Free and Paid Plans
              </h2>
              <p>Laudica offers the following subscription tiers:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  <strong className="text-foreground">Free</strong> — Up to 15
                  testimonials and 3 showcase walls. No credit card required.
                </li>
                <li>
                  <strong className="text-foreground">Pro ($29/month)</strong> —
                  Unlimited testimonials and walls, priority support, and
                  advanced analytics.
                </li>
                <li>
                  <strong className="text-foreground">
                    Business ($79/month)
                  </strong>{" "}
                  — Everything in Pro, plus API access, white-label embedding,
                  and team management features.
                </li>
              </ul>
              <p className="mt-3">
                Paid plans are billed monthly unless otherwise agreed. You may
                cancel your subscription at any time; cancellation takes effect
                at the end of the current billing period. Laudica reserves the
                right to change pricing with at least 30 days&apos; notice.
                Refunds are issued at Laudica&apos;s sole discretion.
              </p>
            </section>

            {/* 5 — Content Ownership */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                6. Content Ownership
              </h2>
              <p>
                You retain full ownership of all testimonial content, media, and
                data you submit to Laudica ("User Content"). By submitting
                User Content, you grant Laudica a non-exclusive, worldwide,
                royalty-free license to host, display, reproduce, and distribute
                your User Content solely for the purpose of operating and
                providing the Service — including embedding testimonial walls on
                third-party websites as directed by you.
              </p>
              <p className="mt-3">
                You represent and warrant that you have all necessary rights and
                permissions to submit User Content and to grant the license
                described above. You are solely responsible for ensuring that
                the testimonials you collect comply with applicable privacy and
                consent laws.
              </p>
            </section>

            {/* 6 — Acceptable Use */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                7. Acceptable Use
              </h2>
              <p>You agree not to use the Service to:</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  Create, publish, or distribute fake, fabricated, or fraudulent
                  testimonials.
                </li>
                <li>
                  Display misleading, deceptive, or defamatory content.
                </li>
                <li>
                  Harass, abuse, or harm other users or third parties.
                </li>
                <li>
                  Violate any applicable local, state, national, or
                  international law or regulation.
                </li>
                <li>
                  Interfere with or disrupt the Service, servers, or networks
                  connected to the Service.
                </li>
                <li>
                  Attempt to gain unauthorized access to any part of the
                  Service.
                </li>
              </ul>
              <p className="mt-3">
                Laudica reserves the right to remove content and suspend or
                terminate accounts that violate this Acceptable Use policy, at
                our sole discretion and without prior notice.
              </p>
            </section>

            {/* 7 — Embed Usage & Distribution */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                8. Embed Usage &amp; Distribution
              </h2>
              <p>
                Laudica provides embed codes that allow you to display
                testimonial walls on external websites. When you use embed
                codes, you agree that:
              </p>
              <ul className="mt-3 list-disc space-y-1.5 pl-6">
                <li>
                  Embeds may load content from Laudica servers and are subject
                  to the availability of the Service.
                </li>
                <li>
                  Free-tier embeds may include Laudica branding. Paid plans
                  (Business tier) may remove or customize branding as described
                  in the plan features.
                </li>
                <li>
                  You are responsible for ensuring that embedded testimonials
                  comply with the laws and regulations of the jurisdictions in
                  which they are displayed.
                </li>
                <li>
                  Laudica is not liable for how embedded content is perceived
                  or used by visitors to your website.
                </li>
              </ul>
            </section>

            {/* 8 — Intellectual Property */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                9. Intellectual Property
              </h2>
              <p>
                The Service — including its software, design, logos, branding,
                documentation, and all related intellectual property — is owned
                by Laudica and protected by copyright, trademark, and other
                intellectual property laws. Nothing in these Terms grants you
                any right, title, or interest in the Service beyond the limited
                license to use it in accordance with these Terms.
              </p>
              <p className="mt-3">
                You may not copy, modify, distribute, sell, or lease any part of
                the Service or its underlying software, nor may you reverse
                engineer or attempt to extract the source code of the Service.
              </p>
            </section>

            {/* 9 — Limitation of Liability */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                10. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by applicable law, Laudica and
                its officers, directors, employees, and agents shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages — including but not limited to loss of profits,
                data, business opportunities, or goodwill — arising out of or
                related to your use of or inability to use the Service.
              </p>
              <p className="mt-3">
                Laudica&apos;s total aggregate liability for all claims
                related to the Service shall not exceed the amount you paid to
                Laudica in the twelve (12) months preceding the event giving
                rise to the claim. The Service is provided on an "as is" and "as
                available" basis without warranties of any kind, whether express
                or implied.
              </p>
            </section>

            {/* 10 — Termination */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                11. Termination
              </h2>
              <p>
                You may terminate your account at any time by contacting support
                or using the account settings within the dashboard. Laudica
                may terminate or suspend your access to the Service immediately,
                without prior notice or liability, for any reason — including if
                you breach these Terms.
              </p>
              <p className="mt-3">
                Upon termination, your right to use the Service will cease
                immediately. Laudica may retain or delete your data in
                accordance with its data retention policies. Any provisions of
                these Terms that by their nature should survive termination will
                remain in effect, including ownership, warranty disclaimers,
                indemnification, and limitations of liability.
              </p>
            </section>

            {/* 11 — Changes to Terms */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                12. Changes to Terms
              </h2>
              <p>
                Laudica reserves the right to modify or replace these Terms at
                any time. If a revision is material, we will provide at least 30
                days&apos; notice before the new terms take effect — for
                example, by posting a notice within the Service or sending an
                email to the address associated with your account. What
                constitutes a material change will be determined at our sole
                discretion.
              </p>
              <p className="mt-3">
                By continuing to access or use the Service after revisions
                become effective, you agree to be bound by the revised Terms.
              </p>
            </section>

            {/* 12 — Governing Law */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                13. Governing Law
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the European Union and the applicable laws of
                the member state in which Laudica is established, without
                regard to conflict of law provisions. Any disputes arising
                under these Terms shall be subject to the exclusive
                jurisdiction of the competent courts in that member state.
                Nothing in this section limits your rights under mandatory
                consumer protection laws of your country of residence.
              </p>
            </section>

            {/* 13 — Contact Information */}
            <section>
              <h2 className="mb-3 text-xl font-semibold text-foreground">
                14. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="mt-3">
                <a
                  href="mailto:support@laudica.com"
                  className="text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
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
