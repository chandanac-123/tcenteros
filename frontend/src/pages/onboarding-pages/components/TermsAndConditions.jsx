import React from "react";

const TermsAndConditions = () => {
    return (
        <div className="flex flex-col gap-4 text-sm sm:text-base p-6">
            <h1 className="text-xl font-bold flex justify-center">TERMS & CONDITIONS</h1>

            <p>
                <strong>Effective Date:</strong> June 16, 2026
            </p>

            <strong>1. Acceptance of Terms</strong>
            <p>
                By accessing or using TCenterOS, you agree to these Terms and
                Conditions.
            </p>
            <p>If you do not agree, you must not use the platform.</p>

            <strong>2. Service Description</strong>
            <p>TCenterOS provides:</p>

            <ul className="list-disc pl-6">
                <li>Training center management</li>
                <li>Student/member management</li>
                <li>Attendance management</li>
                <li>Billing and invoicing</li>
                <li>Reporting and analytics</li>
                <li>CRM and lead management</li>
                <li>Staff management</li>
                <li>Network center booking services</li>
                <li>Mobile and web applications</li>
            </ul>

            <p>Features may vary based on subscription plans.</p>

            <strong>3. Account Responsibilities</strong>
            <p>Users agree to:</p>

            <ul className="list-disc pl-6">
                <li>Provide accurate information</li>
                <li>Maintain account security</li>
                <li>Protect login credentials</li>
                <li>Notify us of unauthorized access</li>
            </ul>

            <p>
                Users are responsible for activities conducted through their accounts.
            </p>

            <strong>4. Subscription and Billing</strong>

            <p className="font-semibold">Subscription Fees</p>

            <p>Subscriptions may be billed:</p>

            <ul className="list-disc pl-6">
                <li>Monthly</li>
                <li>Annually</li>
            </ul>

            <p>Fees are displayed before purchase.</p>

            <p className="font-semibold">Renewals</p>

            <p>Subscriptions renew upon payment of renewal fees.</p>

            <p className="font-semibold">Failure to Pay</p>

            <ul className="list-disc pl-6">
                <li>Suspension</li>
                <li>Restriction of services</li>
                <li>Account termination</li>
            </ul>

            <strong>5. Refund Policy</strong>

            <p>Unless otherwise required by law:</p>

            <ul className="list-disc pl-6">
                <li>Subscription fees are non-refundable.</li>
                <li>Setup fees are non-refundable.</li>
                <li>Custom development fees are non-refundable.</li>
            </ul>

            <p>
                Exceptions may be granted at the sole discretion of TCenterOS.
            </p>

            <strong>6. Network Program Terms</strong>

            <p>For centers participating in the Network Program:</p>

            <ul className="list-disc pl-6">
                <li>Participation is optional.</li>
                <li>Network bookings are subject to availability.</li>
                <li>TCenterOS may modify network rules at any time.</li>
                <li>Abuse of the network system may result in suspension.</li>
            </ul>

            <strong>7. Acceptable Use</strong>

            <p>Users shall not:</p>

            <ul className="list-disc pl-6">
                <li>Violate laws</li>
                <li>Upload malicious software</li>
                <li>Attempt unauthorized access</li>
                <li>Interfere with platform operations</li>
                <li>Use the platform for fraudulent activities</li>
                <li>Infringe intellectual property rights</li>
            </ul>

            <strong>8. Intellectual Property</strong>

            <p>All platform software, branding, content, design, trademarks, and technology remain the exclusive
                property of:</p>
            <strong>Chayaza Private Limited</strong>
            <p>No ownership rights are transferred through platform usage.</p>


            <strong>9. Customer Data</strong>
            <p>Customers retain ownership of their business and member data.</p>
            <p>TCenterOS receives only a limited license necessary to operate the service.</p>


            <strong>10. Service Availability</strong>
            <p>While we strive for uninterrupted service, we do not guarantee:</p>
            <ul className="list-disc pl-6">
                <li> Continuous availability</li>
                <li> Error-free operation</li>
                <li> Uninterrupted access</li>
            </ul>
            <p>Maintenance and downtime may occur.</p>


            <strong>11. Limitation of Liability</strong>
            <p>To the maximum extent permitted by law:</p>
            <p>TCenterOS shall not be liable for:</p>
            <ul className="list-disc pl-6">
                <li> Indirect damages</li>
                <li> Loss of profits </li>
                <li> Loss of business </li>
                <li> Loss of data </li>
                <li> Service interruptions </li>
            </ul>
            <p>Total liability shall not exceed the fees paid by the customer during the preceding twelve months.</p>


            <strong>12. Indemnification</strong>
            <p>Users agree to indemnify and hold harmless TCenterOS and Chayaza Private Limited from claims
                arising from:</p>
            <ul className="list-disc pl-6">
                <li> User misconduct</li>
                <li> Violation of laws</li>
                <li>Breach of these Terms </li>
            </ul>

            <strong>13. Termination</strong>
            <p>We may suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6">
                <li>Non-payment</li>
                <li> Fraud</li>
                <li>Security risks</li>
                <li>Violation of these Terms</li>
            </ul>
            <p>Users may terminate accounts by contacting support.</p>

            <strong>14. Governing Law</strong>
            <p>These Terms shall be governed by the laws of India.</p>
            <p>Any disputes shall be subject to the exclusive jurisdiction of the courts located in Ernakulam, Kerala,
                India.</p>

            <strong>15. Contact</strong>

            <ul className=" pl-6">
                <li>Chayaza Private Limited</li>
                <li> 691854-A1, Innerspace,</li>
                <li>SRM Road, Ernakulam</li>
                <li>Kerala, India</li>
                <li><strong>Website:</strong> tcenteros.com</li>
                <li><strong>Email:</strong> support@tcenteros.com
                </li>
            </ul>
        </div>
    );
};

export default TermsAndConditions;