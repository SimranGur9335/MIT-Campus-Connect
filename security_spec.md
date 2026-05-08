# Security Specification: CampusConnect

## Data Invariants
1. A user cannot create an announcement as another user.
2. A student cannot approve or delete announcements.
3. An announcement cannot have a status other than 'pending' or 'published'.
4. Users can only read their own private notifications.
5. Activity logs are write-only for users (system records) and readable by admins.
6. Admins are the only ones who can change user roles.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Create announcement with `authorId: "someone_else_uid"`.
2. **Privilege Escalation**: Update user profile to `role: "ADMIN"`.
3. **Status Shortcut**: Create announcement with `status: "published"` (should be `pending` for non-admins).
4. **Orphaned Write**: Create notification for a non-existent user.
5. **Ghost Field**: Update announcement with `verified: true` (not in schema).
6. **NoSQL Injection**: Inject huge string into `title` (> 1KB).
7. **Cross-User Delete**: Delete an announcement owned by another faculty member.
8. **PII Leak**: Read `/users/ADMIN_UID/notifications`.
9. **History Manipulation**: Delete or update `activity_logs`.
10. **Role Hijack**: Self-assign `role: "FACULTY"` during registration.
11. **Expired Post**: Read announcement with `expiresAt < now` (if rule enforced).
12. **Empty Intent**: Create announcement with `title: ""` and `content: ""`.

## Test Runner (Draft Logic)
The `firestore.rules.test.ts` will verify these payloads return `PERMISSION_DENIED`.
