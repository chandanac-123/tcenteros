import CustomeModal from "@common/components/CustomeModal";
import React from "react";

const PrivacyPolicy = ({ privacyOpen, setPrivacyOpen }) => {
    return (
        <CustomeModal open={privacyOpen} onOpenChange={setPrivacyOpen}>
            <div className="flex flex-col text-sm sm:text-base">
                <h1 className="text-xl font-bold justify-center flex ">PRIVACY POLICY</h1>

                <p className="text-center  text-sm text-gray-500 mb-8">
                    Effective Date: June 16, 2026
                </p>

                <div className="rounded-lg border bg-gray-50 p-10 gap-4 flex flex-col">
                    <strong>1. Introduction</strong>
                    <p>
                        Welcome to TCenterOS ("Platform", "Service", "we", "our", "us"),
                        operated by Chayaza Private Limited.
                    </p>

                    <p>
                        TCenterOS provides software solutions for training centers, academies,
                        fitness centers, educational institutions, coaching centers, and related
                        organizations to manage memberships, students, attendance, schedules,
                        billing, reporting, communication, and business operations.
                    </p>

                    <p>
                        This Privacy Policy explains how we collect, use, store, disclose, and
                        protect information when you use:
                    </p>

                    <ul className="list-disc pl-16">
                        <li>https://tcenteros.com</li>
                        <li>https://network.tcenteros.com</li>
                        <li>Any mobile applications</li>
                        <li>APIs</li>
                        <li>Partner portals</li>
                        <li>Customer dashboards</li>
                        <li>Related services</li>
                    </ul>

                    <strong>2. Information We Collect</strong>

                    <p className="font-semibold">Account Information</p>

                    <p>When registering an account, we may collect:</p>

                    <ul className="list-disc pl-16">
                        <li>Name</li>
                        <li>Business name</li>
                        <li>Email address</li>
                        <li>Mobile number</li>
                        <li>Address</li>
                        <li>GST information (if applicable)</li>
                        <li>Profile information</li>
                    </ul>

                    <p className="font-semibold">Center Information</p>

                    <ul className="list-disc pl-16">
                        <li>Center name</li>
                        <li>Branch information</li>
                        <li>Staff details</li>
                        <li>Trainer details</li>
                        <li>Membership details</li>
                        <li>Attendance records</li>
                        <li>Billing information</li>
                    </ul>

                    <p className="font-semibold">Student / Member Information</p>

                    <p>Information entered by customers may include:</p>

                    <ul className="list-disc pl-16">
                        <li>Name</li>
                        <li>Mobile number</li>
                        <li>Email</li>
                        <li>Gender</li>
                        <li>Date of birth</li>
                        <li>Membership information</li>
                        <li>Attendance records</li>
                        <li>Payment records</li>
                    </ul>

                    <p className="font-semibold">Technical Information</p>

                    <p>We may automatically collect:</p>

                    <ul className="list-disc pl-16">
                        <li>IP address</li>
                        <li>Browser information</li>
                        <li>Device information</li>
                        <li>Operating system</li>
                        <li>Login activity</li>
                        <li>Usage analytics</li>
                    </ul>

                    <strong>3. How We Use Information</strong>

                    <p>We use information to:</p>

                    <ul className="list-disc pl-16">
                        <li>Provide platform services</li>
                        <li>Process subscriptions</li>
                        <li>Manage memberships</li>
                        <li>Generate invoices</li>
                        <li>Improve platform functionality</li>
                        <li>Provide customer support</li>
                        <li>Send notifications and reminders</li>
                        <li>Maintain security</li>
                        <li>Prevent fraud and abuse</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <strong>4. Ownership of Data</strong>

                    <p>
                        All student, member, trainer, and customer information entered by a
                        center remains the property of that center.
                    </p>

                    <p>
                        TCenterOS acts as a technology service provider and data processor.
                    </p>

                    <p>We do not sell customer data to third parties.</p>

                    <strong>5. Network Module Data Sharing</strong>

                    <p>
                        For centers participating in the TCenterOS Network Program:
                    </p>

                    <ul className="list-disc pl-16">
                        <li>Limited information may be shared between participating centers.</li>
                        <li>
                            Shared information may include membership validity, booking details,
                            attendance verification, and network usage history.
                        </li>
                        <li>
                            Only information necessary to operate the network service will be
                            shared.
                        </li>
                    </ul>

                    <strong>6. Payment Information</strong>

                    <p>
                        Payments may be processed through third-party payment providers such as:
                    </p>

                    <ul className="list-disc pl-16">
                        <li>Razorpay</li>
                        <li>Other authorized gateways</li>
                    </ul>

                    <p>
                        TCenterOS does not store complete credit/debit card information on its
                        servers.
                    </p>

                    <strong>7. Cookies and Analytics</strong>

                    <p>We may use:</p>

                    <ul className="list-disc pl-16">
                        <li>Cookies</li>
                        <li>Session storage</li>
                        <li>Analytics tools</li>
                        <li>Performance monitoring services</li>
                    </ul>

                    <p>
                        These help us improve user experience and platform performance.
                    </p>

                    <strong>8. Data Security</strong>

                    <p>
                        We implement reasonable technical and organizational safeguards
                        including:
                    </p>

                    <ul className="list-disc pl-16">
                        <li>Encrypted connections (SSL/TLS)</li>
                        <li>Secure authentication</li>
                        <li>Access controls</li>
                        <li>Backup systems</li>
                        <li>Monitoring and logging</li>
                    </ul>

                    <p>
                        However, no online service can guarantee absolute security.
                    </p>

                    <strong>9. Data Retention</strong>

                    <p>We retain information:</p>

                    <ul className="list-disc pl-16">
                        <li>While accounts remain active</li>
                        <li>As required by law</li>
                        <li>For dispute resolution</li>
                        <li>For backup and recovery purposes</li>
                    </ul>

                    <p>
                        After account closure, data may be deleted according to our retention
                        schedules.
                    </p>

                    <strong>10. Third-Party Services</strong>

                    <p>The platform may integrate with:</p>

                    <ul className="list-disc pl-16">
                        <li>Payment gateways</li>
                        <li>SMS providers</li>
                        <li>Email providers</li>
                        <li>WhatsApp providers</li>
                        <li>Analytics services</li>
                    </ul>

                    <p>
                        These providers operate under their own privacy policies.
                    </p>

                    <strong>11. Children's Privacy</strong>

                    <p>
                        The platform is intended for businesses and institutions.
                    </p>

                    <p>
                        Parents and institutions are responsible for obtaining necessary consent
                        when storing information related to minors.
                    </p>

                    <strong>12. Your Rights</strong>

                    <p>Subject to applicable laws, users may request:</p>

                    <ul className="list-disc pl-16">
                        <li>Access to data</li>
                        <li>Correction of data</li>
                        <li>Deletion of data</li>
                        <li>Export of data</li>
                        <li>Restriction of processing</li>
                    </ul>

                    <p>Requests may be submitted through support channels.</p>

                    <strong>13. Policy Updates</strong>
                    <ul>
                        <li>We may update this Privacy Policy periodically.</li>
                        <li>Continued use of the platform constitutes acceptance of the revised
                            policy.</li>
                    </ul>

                    <strong>14. Contact</strong>
                    <ul>
                        <li>Chayaza Private Limited</li>
                        <li>TCenterOS Support</li>
                    </ul>

                    <p>
                        <strong>Website:</strong>{" "}
                        <a
                            href="https://tcenteros.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            https://tcenteros.com
                        </a>
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        <a
                            href="mailto:support@tcenteros.com"
                            className="text-blue-600 hover:underline"
                        >
                            support@tcenteros.com
                        </a>
                    </p>
                </div>
            </div>
        </CustomeModal>
    );
};

export default PrivacyPolicy;