# Momken Education ERP — Security & Session Policy Specification

## 1. Executive Summary & Architecture Overview

The **Security & Session Policy Subsystem** of the Momken Education ERP platform governs enterprise access control, authentication, multi-factor authentication (MFA), role-based access control (RBAC), token lifecycle management, active session auditing, and automatic session timeout mitigation.

This specification details the cryptographic standards, policy enforcement engines, middleware interception layers, and UI components implemented to secure institutional data across all campus portals (Admin, SIS, Instructor, Student, Guardian).

---

## 2. Authentication & Credential Governance

### 2.1 Principle of Least Privilege & RBAC
- **Roles**: Distinct institutional roles (`admin`, `sis`, `instructor`, `student`, `guardian`) mapped to hierarchical permissions.
- **Permission Wildcards**: Supports granular permission codes (e.g., `students.read`, `students.create`, `finance.*`, `*`) evaluated via the `AdminAuthEngine`.
- **Server-Side Enforcement**: All API endpoints authenticate incoming requests via bearer tokens or session cookies and evaluate permissions server-side. The client never dictates permissions or trust boundaries.

### 2.2 Multi-Factor Authentication (MFA)
- Mandatory enforcement for administrative and high-privilege roles (`admin`, `sis-lead`).
- Supported methods: TOTP authenticator apps (Google Authenticator / Authy), SMS OTP, and institutional email verification.
- Enforced challenge step during authentication flows when suspicious IP changes or organization-level security policies mandate step-up verification.

---

## 3. Session Policy & Token Lifecycle

### 3.1 Session Token Architecture
- **Access Tokens**: Short-lived (15 minutes) cryptographically signed JWTs containing user ID, tenant ID, organization scope, roles, and permission scopes.
- **Refresh Tokens**: Secure, HttpOnly, SameSite=Strict cookies with rolling expiration (7 days) stored securely and validated against active database session logs.

### 3.2 Idle Timeout & Inactivity Safeguards
- **Inactivity Threshold**: Configurable organization-level idle timeout (default: 30 minutes of no user mouse/keyboard activity).
- **Warning Dialog**: 2 minutes prior to session expiration, the `SessionTimeoutWarning` component renders an accessible Carbon modal prompting the user to extend their session or save state.
- **Automatic Revocation**: Upon timeout expiration, client state is cleared, tokens are invalidated server-side, and the user is securely redirected to `/login` with return URL preservation.

---

## 4. Active Session Auditing & Management

### 4.1 Session Monitoring
- Every successful authentication logs session metadata: IP address, User-Agent, geo-location, device fingerprint, and login timestamp into the `active_sessions` database table.
- **Admin Session Revocation**: Administrators with `sessions.manage` permissions can view all active institutional sessions across campuses and perform instant remote session termination (REVOKE).

---

## 5. Security Safeguards & Compliance

- **SQL Injection Prevention**: All queries parameterized via Prisma ORM.
- **XSS Mitigation**: React JSX auto-escaping combined with strict Content Security Policy (CSP) headers.
- **Audit Logging**: Every sensitive action (role modification, permission grant, student record export, session revocation) is recorded in immutable audit logs with actor ID, timestamp, and action hash.
