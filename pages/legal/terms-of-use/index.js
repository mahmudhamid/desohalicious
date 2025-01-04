import Link from 'next/link';
import { useRouter } from 'next/router';
import Page from '../../../components/Page';
import useCache from '../../../hooks/useCache';
import i18n from '../../../i18n/config';

export default function TermsOfService(props) {
    const router = useRouter();
    const shopBasicData = useCache("shopBasicData");
    const shopname = shopBasicData.name;
    const orderTypes = shopBasicData.orderTypeIDs;
    const domain = window.location.host;
    const basePath = {
        href: "/legal/terms-of-use",
        as: "/legal/terms-of-use"
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    function enText() {
        return (
            <div className="text-component">
                <p><strong>9 May 2021</strong></p>
                <p>Subject to these Terms of Use(this "Agreement"), {shopname}({shopname}, "we", "us" and / or "our") offers food, meals, beverages, and related articles(collectively the "Products") through this website for online ordering(the "Service"). Our Service is based on <a href="https://nitron.app" target="_blank">Nitronapp's</a> cloud e-commerce platform("Nitronapp"). {shopname} and Nitronapp are partners in providing you the Service("Service Providers"). By using or accessing the Services, you(the "customer", "user") acknowledge that you have read, understand, and agree to be bound by this Agreement.</p>
                <p>If you are entering into this Agreement on behalf of a company, business or other legal entity, you represent that you have the authority to bind such entity to this Agreement, in which case the term "you" shall refer to such entity. If you do not have such authority, or if you do not agree with this Agreement, you must not accept this Agreement and may not use the Services.</p>
                <ol className="list list--ol">
                    <li>Use of Service
                        <ol>
                            <li>You certify that you are a person at least 18 years of age. The Service may only be used or accessed through an electronic device controlled of you at all times. A valid user account may only be created and maintained if you provide valid information in the signup process, and you regularly update such information to assure its accuracy.</li>
                            <li>During the period for which you are authorized to use the Service, and subject to your compliance with the terms of this Agreement, you are granted a personal, non - sublicensable, nonexclusive, nontransferable, limited license, to use the Services for your personal use. Any rights not expressly granted herein are reserved and no license or right to use any trademark of the Service Providers or any third - party is granted to you in connection with the Service.</li>
                            <li>The pictures of the products included in our Service are for presentation only. The ordered Products may have differences (e.g. color, form, etc.) towards the photos existing on the Service. We are not liable in any way if the description of products is not complete.</li>
                            <li>Any Products provided through the Service are done so on an "as is" and "if available" basis and we expressly excludes any warranties, conditions, representations or other terms with respect to the Service or the content or Products displayed on it, whether express or implied, unless expressly stated to the contrary.</li>
                            <li>Any order that you place through the Service is not accepted until you receive an email confirming that we have confirmed and preparing your order(the "order confirmation email"). This means that when the Service states that your order has been received, we may still (at our discretion) choose to decline your order until such time as you receive the order confirmation email. If we are unable to accept your order after it has been placed through the Service, we will contact you to confirm this to you.</li>
                            <li>Where you have not made payment in full at the time of placing your order on the Service, you will be solely responsible and liable for making all outstanding payments due in respect of your order at the time that you collect your order from us or we deliver it to you.</li>
                            <li>We reserve the right at our discretion to change the Products, and the prices of Products, available on the Service.</li>
                            <li>We may cancel an order placed by you on the Service, either before or after acceptance of such order, where we believe that inaccurate information was provided as part of the order or where circumstances beyond our reasonable control occur which prevent or hinder completion of such order.</li>
                            <li>In case you would like to change or add Products to your order after your order was placed you will need to make a change request by call us before receving the order confirmation email. Changes to your order Products might not be possible after you receive the order confirmation email. In the case we were able to apply your changes and/or additions of Products to your order and the new total amount of order is more than the amount paid or committed to be paid for the order, you will need to complete the order payment before we process your order. If the new total amount of order is less than the amount paid for order you will receive a website voucher worth the amount remaining to be used within 30 days.</li>
                            <li>Cancelling your order is only possible if your order is still in our orders queue before you receive the order confirmation email. You will need to call us for the order cancellation and in case we were able to cancel your order, the amount paid for order is not refundable, instead, you will receive a website voucher worth the amount paid for the order to be used within 30 days.</li>
                            <li>With respect to information on the status of your order, after having placed the order you are required to be available by telephone or email given in your order.</li>
                            {orderTypes.includes("delivery") ? (
                                <>
                                    <li>If you have chosen for the Products to be delivered, we will aim to provide you with your ordered Products as close as possible to the delivery address and time given in your order. Delivery address or time cannot be changed during the delivery process.</li>
                                    <li>If you have chosen for the Products to be delivered, we will deliver the order to the main entrance of the delivery address but any deliveries carried into the delivery address will only be made if the driver and you consent to this.</li>
                                    <li>If you have chosen for the Products to be delivered, the delivery driver might not wait for your collection of your deliveries. The driver will drop Prodcuts, notify you, and then leave. If you are not present to collect the deliveries at the address given in your order and your order includes Products that require age verification such as alcoholic Products or other Products with an age limit, those Products will be returned back to our store and we will not refund you the price for those Products and will charge you for the full amount of your order.</li>
                                    <li>If you have chosen for the Products to be delivered and the driver has droped your Products in the delivery address given in your order, you shall not contact the driver in any case. If you have any questions or complains about your order and / or Products deliverd, you shall contact us directly.</li>
                                </>
                            ) : null}
                            {orderTypes.includes("delivery") ? (
                                <li>If you have chosen for the Products to be collected by you("self collection") at our store, you should be present at the selected time at our store address, as indicated in the order confirmation email, text message or on the Service.</li>
                            ) : null}
                            <li>Upon delivery or self collection of the Order, we could ask for identification if the order contains alcoholic Products or other Products with an age limit. If you cannot identify yourself adequately or do not meet the minimum age requirements, we will refuse to deliver the relevant Products to you. In this case, cancellation costs may be charged</li>
                            <li>If you place a false order (for example by providing incorrect contact information, by not paying or by not being present on the delivery or collection location in order to receive the order) or otherwise fail to comply with your obligations pursuant to the order, we shall be entitled to refuse any future orders from you.</li>
                            <li>You shall be responsible for maintaining the confidentiality of login information associated with your account. Each user must have unique login credentials that may not to be shared by multiple users. You are responsible for all activities that occur under your account.</li>
                            <li>You shall not attempt to undermine the security or integrity of computing systems or networks of the Service Providers, their partners, or any other user, and must not attempt to gain unauthorized access.</li>
                            <li>You must not introduce software or automated agents or scripts into the Service in order to produce multiple accounts, generate automated searches, requests or queries, or to strip or mine content or data from the Service or Nitronapp.</li>
                            <li>You must not access the Service through automated methods, including any use of robots or other computer code which calls the Service.</li>
                            <li>You must not interfere with or disrupt the Service or create an undue burden on the Service or the networks or services connected to the Service.</li>
                            <li>You must not perform any benchmark tests or analyses relating to the Service without express permission of Nitronapp.</li>
                            <li>The final decision of whether an account is in violation of any of these use terms is at the sole discretion of the Service Providers. You agree that violations of this Agreement by yourself or any user or entity acting under your account will result in termination of your access to the Service. In addition, violation of these terms or any of our policies may result in tracking information being stored to identify the offending user, and permanent restriction from holding an account on the Service.</li>
                        </ol>
                    </li>
                    <li>Third-party websites
                        <p>The Service and/or process may include content, information or links to third parties or third party sites. We are not responsible for the content of any such sites or neither for the content of any third party advertising or sponsorship nor for compliance of such with any regulations. The links may be accessed at the your own risk and we makes no representations or warranties about the content, completeness, or accuracy of these links or the sites hyperlinked to the Service. You agree to hold harmless and relieve us from any liability whatsoever arising from your use of information from a third party or your use of any third-party website.</p>
                    </li>
                    <li>Electronic Communications
                        <p>By using the Services, you consent to receiving electronic communications from us. These electronic communications may include notices about your orders status, updates, and transactional or other information concerning or related to the Service. These electronic communications are part of your relationship with us and you receive them as part of your use of the Service. You agree that any notices, agreements, disclosures or other communications that we send you electronically will satisfy any legal communication requirements, including that such communications be in writing.</p>
                    </li>
                    <li>Disclaimer
                        <p>THE Service AND SUPPORT SERVICES ARE PROVIDED "AS IS" AND THE Service Providers DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE AND NON - INFRINGEMENT. THE Service Providers DOES NOT WARRANT THAT THE Service OR DELIVERABLES WILL BE UNINTERRUPTED OR ERROR FREE; NOR DOES IT MAKE ANY WARRANTY AS TO THE RESULTS THAT MAY BE OBTAINED FROM USE OF THE Service OR DELIVERABLES.</p>
                    </li>
                    <li>Limit of Liability
                        <p>Nitronapp will not be liable whether in contract, in tort (including negligence), under statute or otherwise under or in connection with any claim, damage, loss, cost, expense or other liability suffered or incurred by you in connection with Products or other Products purchased from, or advertised on the Service.</p>
                    </li>
                    <li>Governing Law; Disputes
                        <ol>
                            <li>Law
                                <p>This terms and Conditions shall be governed by and construed in accordance with the laws of the country in which {shopname} is headquartered and {shopname} and any dispute arising out of or in connection with these shall be settled by the competent courts from the headquarter of {shopname}, excluding the possibility of reference to conflict of laws.</p>
                            </li>
                            <li>No Waiver
                                <p>The failure of the Service Providers to exercise or enforce any right or provision of this Agreement shall not be a waiver of that right. You acknowledge that this Agreement is a contract between you and the Service Providers, even though it is electronic and is not physically signed by you and the Service Providers, and it governs your use of the Service.</p>
                            </li>
                            <li>Informal Dispute Resolution
                                <p>To the fullest extent permitted by law, We exclude all liability arising out of its supply of the Products and in particular shall not be responsible for any loss or damage, arising directly or indirectly out of or in connection with delay beyond the estimated delivery or pickup time; any circumstances over which we had no control of the consequences and which we could not avoid by the exercise of reasonable care, or any indirect or unforeseeable loss suffered or incurred by you or others. In any event, our liability to you shall not exceed the total price charged for the relevant Products.</p>
                                <p>If any claim arises out of or relates to the Service or this Agreement, other than as may be provided herein, then you and {shopname} agree to send notice to the other providing a reasonable description of the claim, along with a proposed resolution of it. {shopname} notice to you will be sent based on the most recent contact information that you provided {shopname}. If no such information exists or if such information is not current, {shopname} has no obligation under this section. For a period of sixty(60) days from the date of receipt of notice from the other party, you and {shopname} will engage in a dialog to attempt to resolve the claim, though nothing will require either you or {shopname} to resolve the claim on terms with respect to which you and {shopname}, in each of the parties' sole discretion, is not comfortable.</p>
                            </li>
                        </ol>
                    </li>
                    <li>Changes to this Agreement
                        <p>We may change this Agreement from time to time. We will provide you with notice either by emailing the email address associated with your account or by posting a notice on our website. You can review the most current version of this Agreement at any time at https://{domain}/legal/terms-of-use. The revised Agreement will become effective immediately after we post or send you notice of such changes, and if you use the Service after that date, your use will constitute acceptance of the revised Agreement. If any change to this Agreement is not acceptable to you, your only remedy is to stop using the Service.</p>
                    </li>
                    <li>Privacy
                        <p>Please visit the <Link href="/legal/privacy-notice"><a>Privacy Notice</a></Link> page to understand how we collect and use personal information.</p>
                    </li>
                </ol>
            </div>
        )
    }

    return (
        <Page
            title={i18n.t("TermsOfUse")}
            closeDialogs={closeDialogs}
            basePath={basePath}
            desc={i18n.t("TermsOfUseDesc", { shopname })}
        >
            <article>
                <header className="bg-contrast-lower padding-y-xxl">
                    <div className="container max-width-adaptive-sm">
                        <div className="text-component text-center line-height-lg v-space-md">
                            <h1 className="text-xxxxl">{i18n.t("TermsOfUse")}</h1>
                        </div>
                    </div>
                </header>

                <div className="container max-width-adaptive-sm margin-y-xl">
                    {enText()}
                </div>
            </article>
        </Page>
    )
}