# Imboni-News project audit and repair report

**Scope:** the `server`, `client`, and `admin` source trees supplied in the project archive.

**Important test limitation:** this is a source-code repair and static verification pass. It is not a production certification. The package installation attempts could not complete in this environment, and no live MongoDB instance or staging credentials were supplied. See *Verification and remaining work* below.

## 1. Issues identified and changes made

### Backend — security and API correctness

| Area | Problem identified | Repair made |
|---|---|---|
| Admin seeding | `seedAdmin.js` contained a hard-coded super-admin email/password and printed the credentials. | Seeding now requires `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (minimum 12 characters) from the environment and never prints the password. |
| Authentication | Reader registration accepted short passwords; account creation did not normalize/validate email consistently. | Registration now normalizes email and requires a password of at least 8 characters. User schema minimum updated. |
| Staff accounts | Non-super-admin users could create another admin role; account deletion removed records that may be referenced elsewhere. | Only a super admin can create an admin. User deletion now deactivates accounts and preserves history; self-deactivation/deletion is blocked. |
| Request status privacy | Anyone knowing an advertiser email could query request status and see internal notes. | Public status lookup now requires both email and a randomly generated tracking code and returns only limited status information. |
| Public ad response | Public active-ad response exposed advertiser email and internal impression/click counts. | Public response now exposes only fields needed to display the advertisement. |
| Ad tracking | Any event type was treated as an impression, and arbitrary campaign IDs could be incremented. | Only `impression` and `click` are accepted, and only for campaigns currently active within their schedule. |
| Campaign creation | Request body was spread directly into the model, allowing protected status/statistics fields to be supplied. | Campaign creation now whitelists editable fields and forces the initial state to `pending`. It validates dates, price, destination URL and creative content. |
| Campaign approval | Approval/activation state transitions were not enforced. | Only pending campaigns can be approved. Only approved or paused campaigns within their dates can be activated. Active campaigns can be paused; expired campaigns are marked expired when campaign/active-ad lists are read. |
| Campaign history | Campaigns referenced by invoices or requests could be deleted. | Deletion is blocked when a campaign has request or invoice history. Pausing is available instead. |
| Advertisers | Admin UI called missing update/delete endpoints. | Added advertiser update, safe deactivation and reactivation endpoints. Deactivation preserves linked records and removes the advertiser's ads from public display. |
| Request conversion | Different admin screens used different accept workflows; campaign creation and request conversion could be split and duplicated. | Added a dedicated conversion endpoint, a unique campaign source-request reference and a request processing state. Contacting a customer no longer marks the request converted. |
| Package/duration pricing | Request conversion used fixed prices that did not match the public price table. | Conversion defaults now match the public package/duration prices; the manager can review and adjust the amount before creating the campaign. Custom requests default to Business and require review of the quoted price. |
| Invoice creation | Invoice data accepted client-controlled status/paid fields; campaign and advertiser could be mismatched; invoice numbering used a count-based sequence. | Invoice creation now validates campaign ownership, amount and due date, forces unpaid state, and uses a collision-resistant invoice number with the model's unique index. |
| Invoice history | Paid invoices could be deleted. | Paid invoices cannot be deleted; other invoices are cancelled instead. Overdue invoices are updated when invoices are listed. |
| Announcement permissions | All staff could create, edit, delete and toggle announcements; update accepted arbitrary fields. | Viewing remains staff-only; create/edit/toggle require editor or administrator; deletion requires administrator. Update fields are whitelisted. |
| Article updates | Article update accepted arbitrary body fields, including workflow/author/statistics fields. | Editable article fields are whitelisted; workflow transitions are checked; journalists/photographers can only open their own CMS article detail. |
| Video updates | Video update accepted arbitrary body fields; publishing did not enforce an expected state. | Video updates are whitelisted; publishing is limited to draft/review states; referenced videos cannot be deleted when used as an article's featured video. |
| Categories | Category update accepted arbitrary fields; deletion could orphan article/video/child-category references. | Update fields are whitelisted and slugs regenerated on name changes. Deletion is blocked while the category is referenced. |
| Live streams | Live stream update accepted arbitrary fields, including counters/timestamps. | Only intended editable fields are accepted; live/ended timestamps are set by the server. |
| Media uploads | Upload path depended on the process working directory; arbitrary file types and very large files were accepted by the generic upload middleware. | Uploads use an absolute server upload directory, MIME allowlisting, MIME-derived extensions, one-file limits and bounded file sizes. Media deletion uses a safe basename and matching absolute directory. |
| API middleware | General rate limiter was defined but not applied; JSON body limit was 50 MB. | A baseline API rate limiter is applied; JSON/urlencoded limits are reduced to 2 MB. Multer, malformed JSON, invalid ID and CORS errors receive safer responses. |
| HTTP security | Default CSP would block the project's required YouTube/Vimeo embeds. | A restrictive CSP is configured with the external media frame hosts required by the application. |
| Runtime | Health endpoint did not report database readiness; server shutdown was abrupt. | Health endpoint reports MongoDB readiness; startup validates required configuration and handles SIGINT/SIGTERM gracefully. |
| Visitor analytics | Unique visitor counters existed only in process memory and reset on restart. | Visitor metrics are persisted in MongoDB using keyed hashes rather than storing raw IP addresses. Daily visitor records have a 90-day TTL. |
| Pagination | Several API list endpoints accepted unbounded page sizes. | Article, video, reader and media list limits are capped. |

### Admin application

- Advertising routes now enforce the proposed role policy at the React route layer as well as in the backend.
- Announcement route visibility matches the editor/administrator permission policy.
- Invoice payment and cancellation controls are hidden from ad managers; the backend remains authoritative.
- Campaign approval controls are shown only to administrators; ad managers can activate approved campaigns and pause/resume campaigns.
- Advertiser deactivation is clearly distinguished from deletion and inactive advertisers can be reactivated.
- The request screens now mark a request as contacted instead of falsely converting it without a campaign.
- Campaign conversion uses the dedicated backend conversion endpoint.
- Package selection no longer resets the campaign price to zero.
- Overdue invoices are included in unpaid totals and can be marked paid by administrators.
- User-management screens now describe account deletion as deactivation and enforce the password minimum in the form.

### Public client application

- Advertising request submission now displays a tracking code; checking status requires both the email and that code.
- The public request-status response no longer includes internal admin notes or company contact details.
- Article HTML is passed through a strict browser-side tag/attribute and URL allowlist before rendering.
- Footer image fallback no longer writes HTML directly into the DOM.
- Reader registration password minimum matches the backend.
- App-specific `.env.example` files document the API URL setting for local and production builds.

## 2. Role policy implemented

| Role | Advertising CMS | Announcement CMS |
|---|---|---|
| `super_admin` | Full access | Full access |
| `admin` | Full access, including approval and invoice payment | Full access |
| `ad_manager` | Manage advertisers, requests, campaigns and invoice creation/read; cannot approve campaigns or mark invoices paid | No management access |
| `editor` | No advertising management | View, create, edit and toggle; cannot delete |
| `journalist` | No advertising management | View only |
| `photographer` | No advertising management | View only |
| `video_editor` | No advertising management | View only |
| `reader` | No admin CMS access | Public active announcements only |

Backend middleware is the actual security boundary; hiding a link or button is not treated as sufficient authorization.

## 3. Remaining limitations / work required before production

These items are deliberately not represented as completed:

1. **Runtime and integration testing:** `npm ci` could not complete in this environment because the package registry/cache was unavailable. Therefore Vite production builds and live API/database integration tests could not be run here.
2. **Legacy ad requests:** requests submitted before this repair do not have tracking codes, so their owners cannot use the new public status lookup unless support provides a separate verification process. New requests receive a tracking code.
3. **MongoDB index deployment:** new unique/sparse/TTL indexes must be created and verified in the target database before relying on request-conversion idempotency and visitor metrics. Back up the database first.
4. **Media storage:** uploads currently use local disk. The Cloudinary configuration exists but is not wired into the upload middleware. Production hosting should use Cloudinary or another persistent object-storage service, especially if the host has ephemeral disks.
5. **Upload inspection:** MIME type is allowlisted, but file contents are not yet verified by magic-byte inspection or antivirus scanning. Add this before accepting untrusted uploads at scale.
6. **Rate-limit storage:** Express rate limiting currently uses its default in-memory store. Multi-instance production deployments should use a shared Redis store.
7. **Authentication token storage:** both React apps store JWTs in `localStorage`. This is compatible with the current bearer-token API, but a later security phase should evaluate short-lived access tokens and secure HttpOnly refresh cookies.
8. **Email workflows:** email verification, password reset, and sending advertiser tracking/status emails are not implemented. Nodemailer configuration alone does not mean those workflows exist.
9. **Payments:** invoice payment marking is a manual administrator action. No payment gateway, webhook verification, bank reconciliation or automatic receipt generation is integrated.
10. **Comments/news tips:** corresponding model files exist, but a complete public/admin API and user workflow were not found in the current route set.
11. **Analytics semantics:** unique visitors are estimates based on a keyed hash of the request IP. They are not authenticated unique people; proxy configuration must be correct. Rotating `JWT_SECRET` changes the hashes and resets the historical unique count.
12. **Operational controls:** add centralized production logs, alerting, backups/restore drills, database migration procedures and monitoring before launch.
13. **Existing credentials:** if the old seed script was ever run, rotate the existing super-admin password in the database. Removing the hard-coded password from the script does not change an already-created account.
14. **Existing secrets:** the uploaded archive contained `server/.env`; it has intentionally not been copied into this repaired package. If its credentials were shared outside your machine, rotate them.

## 4. Verification performed on this repaired copy

- Node syntax check passed for every backend `.js` source file.
- TypeScript compiler parser/transpiler syntax check passed for all `.js` and `.jsx` source files in `server/src`, `client/src` and `admin/src`.
- Static relative-import check found no missing relative imports.
- Static named-import/export check found no mismatches.
- Static scans checked route declarations, mass-assignment patterns, raw HTML sinks and environment files.
- These checks do not replace `npm ci`, `npm run build`, automated tests or a staging deployment.

## 5. Deployment status

**Not yet production-ready for public deployment.** This package is a repaired development/staging candidate. Complete the remaining tests, configure persistent media storage, secrets, MongoDB indexes, HTTPS, backups and monitoring before going live.
