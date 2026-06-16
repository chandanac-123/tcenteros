import CustomeModal from "@common/components/CustomeModal";
import React from "react";

const TermsDoc = ({ termsOpen, setTermsOpen }) => {
    return (
        <CustomeModal open={termsOpen} onOpenChange={setTermsOpen}>
            <div className="max-w-4xl mx-auto p-6 gap-4 flex flex-col">
                <h1 className="font-semibold">TCenterOS Partner & Reseller Program Terms</h1>
                <p>
                    <strong>Effective Date:</strong> June 16, 2026
                </p>

                <p>
                    By registering as a Partner, Referral Partner, Channel Partner, or
                    Reseller on TCenterOS, you agree to the following terms and conditions.
                </p>

                <strong>1. Purpose of the Program</strong>
                <p>
                    The TCenterOS Partner Program enables individuals, agencies, consultants, trainers, and businesses
                    to refer potential customers to TCenterOS and earn commissions on successful subscriptions
                    purchased through their referral.
                </p>

                <p>
                    Participation in the program does not create any employment, franchise, agency, partnership, or joint
                    venture relationship with TCenterOS or Chayaza Private Limited.
                </p>

                <strong>2. Eligibility</strong>
                <p>
                    To participate, you must:
                </p>
                <ul className="list-disc pl-6">
                    <li>Be at least 18 years old.</li>
                    <li>Provide accurate registration information.</li>
                    <li>Maintain valid contact details.</li>
                    <li>Comply with all applicable laws and regulations.</li>
                    <li>Complete any verification or KYC process requested by TCenterOS.</li>
                </ul>

                <p>
                    TCenterOS reserves the right to approve or reject any partner
                    application without providing reasons.
                </p>

                <strong>3. Partner Responsibilities</strong>
                <p>
                    Partners agree to:
                </p>
                <ul className="list-disc pl-6">
                    <li>Promote TCenterOS ethically and professionally.</li>
                    <li>Provide accurate information about products and services.</li>
                    <li>Avoid misleading, false, or exaggerated claims.</li>
                    <li>Respect customer privacy.</li>
                    <li>Follow applicable advertising and marketing laws.</li>
                    <li>Maintain the reputation of TCenterOS.</li>
                </ul>

                <h3>Partners shall not:</h3>
                <ul className="list-disc pl-6">
                    <li>Use spam marketing.</li>
                    <li>Engage in fraudulent lead generation.</li>
                    <li>Misrepresent themselves as employees of TCenterOS.</li>
                    <li>Offer unauthorized discounts or promises.</li>
                    <li>Use copyrighted materials without permission.</li>
                </ul>

                <strong>4. Referral Process</strong>
                <p>
                    A referral shall be considered valid when:
                </p>
                <ul className="list-disc pl-6">
                    <li>The lead is submitted through the official partner dashboard.</li>
                    <li> The lead is not already registered with TCenterOS.</li>
                    <li> The lead is not already assigned to another partner.</li>
                    <li> The customer completes payment successfully.</li>

                </ul>
                <p>
                    TCenterOS reserves the right to determine lead ownership in case of duplicate submissions.
                </p>

                <strong>5. Commission Eligibility</strong>
                <p>
                    Commission is payable only when:
                </p>
                <ul className="list-disc pl-6">
                    <li>The referred customer successfully subscribes.</li>
                    <li>Payment has been received by TCenterOS.</li>
                    <li>The payment is not refunded, disputed, reversed, or charged back.</li>

                </ul>

                <h3>No commission is payable on:</h3>
                <ul className="list-disc pl-6">
                    <li> Free plans.</li>
                    <li> Trial accounts.</li>
                    <li> Promotional accounts.</li>
                    <li> Internal company accounts.</li>
                    <li> Accounts suspended for fraud.</li>
                </ul>


                <strong>6. Commission Structure</strong>
                <p>
                    Commission rates shall be determined by TCenterOS and may be displayed in the Partner
                    Dashboard.
                </p>
                <p>
                    TCenterOS reserves the right to:
                </p>
                <ul className="list-disc pl-6">
                    <li> Modify commission rates.</li>
                    <li> Introduce promotional commission structures.</li>
                    <li> Change eligibility criteria.</li>
                </ul>
                <p>
                    Any changes shall apply prospectively and shall not affect already approved commissions.
                </p>

                <strong>7. Commission Payment</strong>
                <p>
                    Approved commissions shall be paid:
                </p>
                <ul className="list-disc pl-6">
                    <li> Monthly</li>
                    <li> Quarterly</li>
                    <li> Or according to the payout cycle specified in the Partner Dashboard</li>

                </ul>
                <p>
                    Payments may be made through:
                </p>
                <ul className="list-disc pl-6">
                    <li> Bank Transfer</li>
                    <li> UPI</li>
                    <li> Other approved methods</li>
                </ul>
                <p>
                    Minimum payout limits, if applicable, will be displayed in the Partner Dashboard.
                </p>

                <strong>8. Tax Responsibilities</strong>
                <p>
                    Partners are solely responsible for:
                </p>
                <ul className="list-disc pl-6">
                    <li> Income tax obligations.</li>
                    <li> GST compliance (if applicable).</li>
                    <li> Business registrations required under local laws.</li>

                </ul>
                <p>
                    TCenterOS may deduct TDS or other legally required deductions before making payouts.
                </p>

                <strong>9. Lead Ownership</strong>
                <p>
                    A lead submitted by a partner remains protected for a period determined by TCenterOS.
                </p>
                <p>
                    If the customer independently contacts TCenterOS before partner registration of the lead, commission
                    eligibility may be denied.
                </p>
                <p> TCenterOS reserves the right to verify ownership of any lead.</p>

                <strong>10. Intellectual Property</strong>
                <p>
                    The following remain the exclusive property of TCenterOS and Chayaza Private Limited:
                </p>
                <ul className="list-disc pl-6">
                    <li>Brand names</li>
                    <li> Logos</li>
                    <li> Product materials</li>
                    <li> Marketing assets</li>
                    <li> Documentation</li>
                    <li> Software</li>
                </ul>
                <p> Partners receive a limited, non-exclusive, revocable license to use approved marketing materials
                    solely for promoting TCenterOS.</p>

                <strong>11. Confidentiality</strong>
                <p>
                    Partners shall keep confidential:
                </p>
                <ul className="list-disc pl-6">
                    <li>Customer information</li>
                    <li> Pricing information</li>
                    <li> Internal business processes</li>
                    <li> Commission structures</li>
                    <li> Product roadmaps</li>
                </ul>
                <p> Confidential information shall not be disclosed to third parties without written consent.</p>

                <strong>12. Customer Relationship</strong>
                <p>
                    Customers remain direct customers of TCenterOS.
                </p>
                <p>
                    TCenterOS shall have full authority regarding:
                </p>
                <ul className="list-disc pl-6">
                    <li> Pricing</li>
                    <li> Product features</li>
                    <li> Technical support</li>
                    <li> Account management</li>
                    <li> Subscription management</li>
                    <li> Refund decisions</li>
                </ul>
                <p>Partners may assist customers but do not own customer accounts.</p>


                <strong>13. Suspension or Termination</strong>
                <p>
                    TCenterOS may suspend or terminate a partner account immediately if:
                </p>
                <ul className="list-disc pl-6">
                    <li> Fraudulent activities are detected.</li>
                    <li> False information is provided.</li>
                    <li> Marketing misconduct occurs.</li>
                    <li> Terms are violated.</li>
                    <li> Customer complaints indicate unethical behavior.</li>
                </ul>
                <p>
                    Upon termination:
                </p>
                <ul className="list-disc pl-6">
                    <li> Pending commissions may be withheld pending investigation.</li>
                    <li> Access to the Partner Dashboard may be revoked.</li>
                </ul>


                <strong>14. Limitation of Liability</strong>
                <p>
                    TCenterOS shall not be liable for:
                </p>
                <ul className="list-disc pl-6">
                    <li> Loss of business opportunities. </li>
                    <li> Indirect damages. </li>
                    <li> Consequential damages. </li>
                    <li> Business interruption. </li>
                </ul>
                <p>
                    Total liability shall not exceed commissions earned by the partner during the previous twelve months.
                </p>


                <strong>15. Modification of Program</strong>
                <p>
                    TCenterOS reserves the right to:
                </p>
                <ul className="list-disc pl-6">
                    <li> Modify the Partner Program. </li>
                    <li> Change commission structures. </li>
                    <li> Update platform features. </li>
                    <li> Introduce new eligibility requirements. </li>
                </ul>
                <p>
                    Continued participation constitutes acceptance of such changes.
                </p>


                <strong>16. Governing Law</strong>
                <p>
                    These Terms shall be governed by the laws of India.
                </p>
                <p>
                    Any disputes shall be subject to the exclusive jurisdiction of the courts of Ernakulam, Kerala, India.
                </p>


                <strong>Partner Declaration</strong>
                <p>By registering as a Partner, I confirm that:</p>
                <ul className="space-y-2 ">
                    <li className="flex  gap-2">
                        <span>
                            <input type="checkbox" checked readOnly />
                        </span>
                        <span>I have read and understood these Partner Terms.</span>
                    </li>
                    <li className="flex  gap-2">
                        <span>
                            <input type="checkbox" checked readOnly />
                        </span>
                        <span>I will market TCenterOS ethically and professionally.</span>
                    </li>
                    <li className="flex  gap-2">
                        <span>
                            <input type="checkbox" checked readOnly />
                        </span>
                        <span>
                            I understand that commissions are payable only on successful and valid
                            subscriptions.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span>
                            <input type="checkbox" checked readOnly />
                        </span>
                        <span>
                            I acknowledge that TCenterOS may modify commission structures and
                            program policies from time to time.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span>
                            <input type="checkbox" checked readOnly />
                        </span>
                        <span>
                            I agree to comply with all applicable laws and regulations.
                        </span>
                    </li>
                </ul>

            </div>
        </CustomeModal>
    );
};

export default TermsDoc;