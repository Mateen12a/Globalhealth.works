import { motion } from "framer-motion";
import { FileText, Scale, AlertTriangle, Shield, Users, Briefcase, UserCheck, ClipboardList, Handshake, Ban, Brain, Lock, DollarSign, ExternalLink, XCircle, Gavel, Settings, Mail } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/landing/Footer";

const sections = [
  {
    icon: FileText,
    title: "1. Introduction and Acceptance",
    content: [
      'Welcome to GlobalHealth.Works ("GHW", "we", "us", or "our"). GHW is a digital marketplace that connects global health organisations with remote professionals offering services including data analysis, policy research, proposal writing, and related support.',
      'By registering for an account or using any part of the GHW platform, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not use the platform.',
      "These Terms constitute a legally binding agreement between you and GlobalHealth.Works.",
      "We reserve the right to update these Terms at any time. Where changes are material, we will notify registered users by email or via a notice on the platform. Continued use after changes take effect constitutes acceptance of the updated Terms."
    ]
  },
  {
    icon: UserCheck,
    title: "2. Eligibility",
    intro: "To use GHW you must:",
    content: [
      "be at least 18 years of age;",
      "have the legal capacity to enter into binding contracts in your jurisdiction; and",
      "not be prohibited from using the platform under applicable law."
    ],
    outro: "GHW is open to users worldwide. By using the platform, you represent that your use complies with local laws applicable to you."
  },
  {
    icon: ClipboardList,
    title: "3. Account Registration",
    intro: "To access core features of GHW, you must create an account. You agree to:",
    content: [
      "provide accurate, current, and complete information during registration;",
      "maintain the security of your login credentials;",
      "notify us immediately of any unauthorised access to your account; and",
      "take responsibility for all activity that occurs under your account."
    ],
    outro: "We reserve the right to suspend or terminate accounts that contain false information or that are used in violation of these Terms."
  },
  {
    icon: Users,
    title: "4. User Types and Roles",
    intro: "GHW has two primary user roles:",
    content: [],
    subsections: [
      {
        title: "4.1 Task Owners",
        text: "Task Owners are entities (NGOs, academic institutions, government agencies, consultancies, or similar) that post tasks and seek professional support. Task Owners are responsible for the accuracy of task descriptions, the conduct of their engagement with professionals, and compliance with any applicable employment or contracting law in their jurisdiction."
      },
      {
        title: "4.2 Solution Providers",
        text: "Solution Providers are individuals who create profiles and offer their skills and services for tasks posted on GHW. Solution Providers are independent contractors and are not employees, agents, or partners of GHW. Solution Providers are responsible for the quality and timeliness of their work and for meeting any professional standards applicable to their field."
      }
    ]
  },
  {
    icon: Handshake,
    title: "5. Tasks and Engagements",
    content: [
      "GHW provides a platform for Task Owners and Solution Providers to discover and connect with one another. We do not guarantee that any task will be completed, that any Solution Provider will be engaged, or that any Task Owner will post tasks.",
      "Any agreement formed between a Task Owner and a Solution Provider as a result of a GHW connection is solely between those parties. GHW is not a party to any such agreement and accepts no liability arising from it."
    ],
    intro2: "Task listings must not:",
    content2: [
      "be misleading or inaccurate;",
      "request work that is unlawful or unethical;",
      "discriminate on grounds prohibited by applicable law; or",
      "advertise paid roles as unpaid or exploit the labour of Solution Providers."
    ]
  },
  {
    icon: Ban,
    title: "6. Acceptable Use",
    intro: "You agree not to use GHW to:",
    content: [
      "violate any applicable law or regulation;",
      "post or transmit content that is defamatory, abusive, harassing, or discriminatory;",
      "impersonate any person or organisation, or misrepresent your credentials;",
      "upload malicious code, viruses, or any software intended to disrupt the platform;",
      "scrape, harvest, or collect data from the platform without our express written consent;",
      "use the platform for any purpose other than legitimate professional engagement in the global health sector; or",
      "circumvent any access controls or security measures."
    ],
    outro: "We reserve the right to remove content and suspend or terminate accounts that violate these provisions without prior notice."
  },
  {
    icon: Brain,
    title: "7. Intellectual Property",
    content: [
      "The GHW platform, including its design, branding, software, and content produced by us, is owned by or licensed to GlobalHealth.Works and is protected by applicable intellectual property laws.",
      "Content you submit to GHW (such as your profile, task descriptions, or messages) remains owned by you. By submitting content, you grant GHW a non-exclusive, worldwide, royalty-free licence to use, display, and reproduce that content solely for the purpose of operating and improving the platform.",
      "You must not reproduce, distribute, or create derivative works from GHW's platform content without our written permission."
    ]
  },
  {
    icon: Lock,
    title: "8. Privacy and Data",
    content: [
      "When you create an account, GHW collects the personal information you provide (such as your name, email address, and professional profile details). We use this information solely to operate the platform, match Task Owners with Solution Providers, and communicate with you about your account.",
      "We do not sell your personal data to third parties. We may share data with trusted service providers who help us run the platform (such as hosting and email services), who are bound by confidentiality obligations. We may also disclose data where required by law.",
      "You have the right to access, correct, or request deletion of your personal data at any time by contacting us at info@globalhealth.works. We retain account data for as long as your account is active and for a reasonable period thereafter for legitimate business purposes.",
      "We process personal data in accordance with applicable data protection legislation. Users are responsible for handling any personal data of others accessed through GHW in a lawful manner."
    ]
  },
  {
    icon: DollarSign,
    title: "9. Fees and Payments",
    content: [
      "GHW is currently free to use for all users. We intend to introduce paid tiers in the future, offering enhanced features and functionality. When paid tiers are introduced, we will provide users with clear advance notice of pricing, what is included, and any changes to what remains available under the free tier.",
      "No payment information is required at this time. Any future billing will be subject to updated terms which will be communicated to users before they take effect."
    ]
  },
  {
    icon: AlertTriangle,
    title: "10. Disclaimers and Limitation of Liability",
    content: [
      'GHW is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the platform\'s reliability, accuracy, availability, or fitness for a particular purpose.',
      "GHW does not vet, endorse, or guarantee the credentials, qualifications, or performance of any Solution Provider listed on the platform, nor the legitimacy or financial capacity of any Task Owner.",
      "To the fullest extent permitted by applicable law, GHW shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, the platform. Our total liability to you for any claim arising under or in connection with these Terms shall not exceed the amount you have paid to GHW in the twelve months preceding the claim (or, where you have paid nothing, a nominal sum of USD 100).",
      "Nothing in these Terms limits liability for fraud, death, or personal injury caused by negligence, or any other liability that cannot be excluded under applicable law."
    ]
  },
  {
    icon: ExternalLink,
    title: "11. Third-Party Links and Services",
    content: [
      "GHW may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of any third-party sites. Access to such sites is at your own risk."
    ]
  },
  {
    icon: XCircle,
    title: "12. Termination",
    content: [
      "You may close your account at any time by contacting us at info@globalhealth.works. We may suspend or terminate your account at our discretion, including for violation of these Terms, with or without notice.",
      "Upon termination, your right to access the platform ceases immediately. Sections of these Terms that by their nature should survive termination (including intellectual property, disclaimers, and limitation of liability provisions) will continue to apply."
    ]
  },
  {
    icon: Gavel,
    title: "13. Governing Law and Disputes",
    content: [
      "These Terms are governed by the laws of England and Wales, without regard to conflict of law principles. This choice of governing law reflects the location of the platform's founders and does not limit the rights you may have under the laws of your own jurisdiction.",
      "We encourage users to resolve disputes informally in the first instance by contacting us at info@globalhealth.works. Where disputes cannot be resolved informally, they shall be subject to the non-exclusive jurisdiction of the courts of England and Wales.",
      "Nothing in this clause prevents you from bringing a claim in the courts of your own country where you have a statutory right to do so."
    ]
  },
  {
    icon: Settings,
    title: "14. General Provisions",
    content: [
      "If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect. Our failure to enforce any right under these Terms does not constitute a waiver of that right.",
      "These Terms, together with our Privacy Policy, constitute the entire agreement between you and GHW regarding your use of the platform and supersede any prior arrangements or representations."
    ]
  },
  {
    icon: Mail,
    title: "15. Contact",
    content: [
      "If you have questions about these Terms or the platform, please contact us at info@globalhealth.works."
    ]
  }
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-6">
              Terms of <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary-light)] bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Please read these terms carefully before using GlobalHealth.Works.
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-4">
              Effective Date: February 2026 | Version 1.0
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Last updated: February 2026
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-white">
                    <section.icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">{section.title}</h2>
                </div>
                <div className="ml-14">
                  {section.intro && (
                    <p className="text-[var(--color-text-secondary)] mb-3 leading-relaxed">{section.intro}</p>
                  )}

                  {section.content && section.content.length > 0 && (
                    section.intro || section.intro2 ? (
                      <ul className="space-y-3 mb-4">
                        {section.content.map((item, i) => (
                          <li key={i} className="text-[var(--color-text-secondary)] flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="space-y-4">
                        {section.content.map((item, i) => (
                          <p key={i} className="text-[var(--color-text-secondary)] leading-relaxed">{item}</p>
                        ))}
                      </div>
                    )
                  )}

                  {section.outro && (
                    <p className="text-[var(--color-text-secondary)] mt-3 leading-relaxed">{section.outro}</p>
                  )}

                  {section.subsections && section.subsections.map((sub, i) => (
                    <div key={i} className="mt-4">
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">{sub.title}</h3>
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">{sub.text}</p>
                    </div>
                  ))}

                  {section.intro2 && (
                    <p className="text-[var(--color-text-secondary)] mt-4 mb-3 leading-relaxed">{section.intro2}</p>
                  )}

                  {section.content2 && (
                    <ul className="space-y-3">
                      {section.content2.map((item, i) => (
                        <li key={i} className="text-[var(--color-text-secondary)] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
