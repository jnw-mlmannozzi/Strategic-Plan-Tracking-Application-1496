import React from 'react'
import { motion } from 'framer-motion'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-secondary mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Information We Collect</h2>
              <p className="text-secondary mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support.
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Account information (name, email address, organization name)</li>
                <li>Strategic planning data you input into our platform</li>
                <li>Usage information and analytics</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. How We Use Your Information</h2>
              <p className="text-secondary mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. Information Sharing</h2>
              <p className="text-secondary mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>With your consent or at your direction</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Data Security</h2>
              <p className="text-secondary mb-4">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. This includes:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Your Rights</h2>
              <p className="text-secondary mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Cookies and Analytics</h2>
              <p className="text-secondary mb-4">
                We use cookies and similar technologies to enhance your experience and analyze usage patterns. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Changes to This Policy</h2>
              <p className="text-secondary mb-4">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the effective date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Contact Us</h2>
              <p className="text-secondary mb-4">
                If you have questions about this privacy policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-secondary">
                  <strong>Email:</strong> help@jnwconsulting.org<br/>
                  <strong>Company:</strong> JNW Consulting LLC
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Privacy