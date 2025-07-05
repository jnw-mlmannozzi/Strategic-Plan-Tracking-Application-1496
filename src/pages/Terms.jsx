import React from 'react'
import { motion } from 'framer-motion'

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-primary mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-secondary mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance of Terms</h2>
              <p className="text-secondary mb-4">
                By accessing and using StrategyPilot, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please 
                do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">2. Description of Service</h2>
              <p className="text-secondary mb-4">
                StrategyPilot is a strategic planning platform that helps organizations create, 
                manage, and track their strategic initiatives. Our service includes:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Strategic plan creation and management tools</li>
                <li>Progress tracking and reporting features</li>
                <li>Team collaboration capabilities</li>
                <li>Data import/export functionality</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">3. User Accounts</h2>
              <p className="text-secondary mb-4">
                To use our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">4. Subscription and Payment</h2>
              <p className="text-secondary mb-4">
                Our service is provided on a subscription basis. By subscribing, you agree to:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Pay all fees associated with your subscription</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Price changes with 30 days notice</li>
                <li>No refunds for partial months of service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">5. Free Trial</h2>
              <p className="text-secondary mb-4">
                We offer a 7-day free trial for new subscribers. During the trial period:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>You have access to all features</li>
                <li>No charges will be made during the trial</li>
                <li>You can cancel at any time without charge</li>
                <li>Subscription begins automatically after trial ends</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">6. Acceptable Use</h2>
              <p className="text-secondary mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Interfere with the service's operation</li>
                <li>Access other users' accounts without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">7. Data Ownership</h2>
              <p className="text-secondary mb-4">
                You retain ownership of all data you input into our service. We provide:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Data export capabilities</li>
                <li>Secure data storage and backup</li>
                <li>Data deletion upon account termination</li>
                <li>Access controls to protect your data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">8. Service Availability</h2>
              <p className="text-secondary mb-4">
                While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                We are not liable for any downtime or service interruptions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">9. Limitation of Liability</h2>
              <p className="text-secondary mb-4">
                To the maximum extent permitted by law, JNW Consulting LLC shall not be liable 
                for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibent text-primary mb-4">10. Termination</h2>
              <p className="text-secondary mb-4">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-secondary space-y-2">
                <li>Your access to the service will be suspended</li>
                <li>You may export your data for 30 days</li>
                <li>All data will be permanently deleted after 30 days</li>
                <li>No refunds will be provided for unused time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">11. Changes to Terms</h2>
              <p className="text-secondary mb-4">
                We may modify these terms at any time. We will notify users of significant changes 
                via email or through the service. Continued use constitutes acceptance of new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-primary mb-4">12. Contact Information</h2>
              <p className="text-secondary mb-4">
                For questions about these terms, please contact us:
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

export default Terms