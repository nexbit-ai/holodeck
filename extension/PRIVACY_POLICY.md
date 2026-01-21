# Privacy Policy for Nexbit Demo Builder

**Last Updated:** January 22, 2026

## Introduction

Nexbit Demo Builder ("we," "our," or "the extension") is a Chrome extension that allows users to record and capture DOM interactions on web pages to create interactive product demonstrations. We are committed to protecting your privacy and being transparent about how we collect, use, and protect your data.

This privacy policy explains what data we collect, how we use it, and your rights regarding your information.

## Information We Collect

### Data Collected During Recording

When you actively start a recording session, we collect:

- **DOM Snapshots**: Complete HTML structure of the web pages you are recording, including visible content, styles, and layout information
- **User Interactions**: Click coordinates, scroll positions, and viewport dimensions during your recording session
- **Navigation Data**: URLs of pages visited during an active recording session
- **Timestamps**: Recording start time and interaction timestamps for playback synchronization
- **Browser Metadata**: Browser type, extension version, screen resolution, and viewport size

### Authentication Data

To provide account functionality, we collect:

- **Session Tokens**: Stytch authentication session JWT and session tokens
- **User Information**: Name and email address provided through Stytch authentication
- **Organization ID**: Your Stytch organization identifier

### Technical Data

- **Local Storage**: Recording state and authentication tokens stored locally in your browser
- **Usage Data**: Extension installation and basic usage metrics (no personal data)

## How We Use Your Information

We use the collected information solely for the following purposes:

1. **Creating Demo Recordings**: Processing and storing your recorded sessions to create playable demonstrations
2. **User Authentication**: Verifying your identity and maintaining your login session
3. **Service Delivery**: Saving recordings to your Nexbit account and enabling playback in the editor
4. **Service Improvement**: Analyzing usage patterns to improve extension functionality (aggregated and anonymized data only)
5. **Technical Support**: Diagnosing and resolving technical issues when you contact support

### What We DO NOT Do

- ❌ We DO NOT collect data when the extension is not actively recording
- ❌ We DO NOT use your data for advertising or marketing purposes
- ❌ We DO NOT sell, rent, or share your data with third parties for their commercial purposes
- ❌ We DO NOT track your browsing activity outside of active recording sessions
- ❌ We DO NOT access or read your data for any purpose other than providing the service

## Data Storage and Security

### Where Your Data is Stored

- **Recording Data**: Stored on Nexbit backend servers at `api-studio.nexbit.ai`
- **Authentication Tokens**: Stored locally in your browser using Chrome's storage API
- **Location**: Data is processed and stored on secure cloud servers

### Security Measures

We implement industry-standard security measures including:

- HTTPS encryption for all data transmission
- Secure token-based authentication using Stytch
- Access controls limiting data access to authorized personnel only
- Regular security audits and updates

### Data Retention

- **Recording Data**: Recordings are stored until you delete them from your account
- **Authentication Data**: Session tokens expire according to Stytch's security policies
- **Account Data**: Retained as long as your account is active
- **Deleted Data**: Permanently removed from our servers within 30 days of deletion

## Data Sharing and Third Parties

We do not sell, trade, or transfer your data to third parties. We may share data only in the following limited circumstances:

1. **Service Providers**: Stytch for authentication (subject to their privacy policy)
2. **Legal Requirements**: When required by law, court order, or to protect our legal rights
3. **Business Transfers**: In the event of a merger or acquisition, with prior user consent
4. **Security Protection**: To prevent fraud, abuse, or security threats

All third-party services we use are required to maintain the confidentiality and security of your data.

## Your Rights and Choices

You have the following rights regarding your data:

### Access and Portability
- View all your recordings through the Nexbit dashboard
- Export your recordings in standard formats

### Deletion
- Delete individual recordings at any time through the Nexbit interface
- Request complete account deletion by contacting us

### Correction
- Update your account information through your Nexbit account settings

### Withdrawal of Consent
- Uninstall the extension at any time to stop all data collection
- Log out to clear local authentication data

## Chrome Extension Permissions

The extension requests the following permissions, which are used only as described:

### `activeTab`
**Why we need it:** To capture DOM snapshots of the currently active tab when you explicitly start a recording session.

**What we do:** Read the visible HTML, CSS, and page structure of tabs you choose to record.

**What we don't do:** Access tabs you're not recording, read sensitive form data, or track your browsing.

### `storage`
**Why we need it:** To store recording state and authentication tokens locally in your browser.

**What we do:** Save your login session and maintain recording state across browser sessions.

**What we don't do:** Access or transmit this data except to authenticate with our servers.

### Content Scripts on `<all_urls>`
**Why we need it:** To enable recording functionality on any website you choose to record.

**What we do:** Inject recording listeners only when you explicitly start a recording session.

**What we don't do:** Run scripts or collect data on pages where you haven't started recording.

### Content Scripts on Nexbit Domains
**Why we need it:** To sync your login session between the web app and extension.

**What we do:** Read authentication cookies from `studio.nexbit.ai` to keep you logged in.

**What we don't do:** Access cookies from other websites or share your credentials.

## Chrome Web Store Limited Use Compliance

This extension complies with the Chrome Web Store's Limited Use policy:

- We collect user data only for the single purpose of creating and storing demo recordings
- We do not use data for personalized advertising
- We do not sell or transfer user data to third parties (except as required by law)
- We do not use data for creditworthiness or lending purposes
- Human access to user data is limited to debugging and support with explicit user consent

## Children's Privacy

Our service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.

## International Users

If you are accessing our service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States and other countries where our servers are located. By using our service, you consent to this transfer.

## Changes to This Privacy Policy

We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make changes:

- We will update the "Last Updated" date at the top of this policy
- For material changes, we may notify you via email or through the extension
- Continued use of the extension after changes constitutes acceptance of the updated policy

We encourage you to review this policy periodically.

## Contact Us

If you have questions, concerns, or requests regarding this privacy policy or our data practices, please contact us:

**Email:** founder@nexbit.ai
**Website:** https://nexbit.ai  
**Support:** founder@nexbit.ai

For privacy-specific inquiries or to exercise your data rights, please include "Privacy Request" in your email subject line.

## Legal Compliance

This privacy policy is designed to comply with:

- General Data Protection Regulation (GDPR) for European users
- California Consumer Privacy Act (CCPA) for California residents
- Chrome Web Store Developer Program Policies
- Other applicable data protection laws

If you are in the European Economic Area (EEA) or California, you may have additional rights under GDPR or CCPA. Please contact us to exercise these rights.

---

**Developer:** Nexbit Team  
**Extension Name:** Nexbit Demo Builder  
**Version:** 0.0.1  
**Privacy Policy Version:** 1.0
