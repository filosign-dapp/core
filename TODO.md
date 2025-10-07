# Filosign SDK Integration Roadmap

## Overview

This document outlines the complete integration of Filosign SDK functionalities into the production UI. Currently, only authentication and basic sharing work - core document management features exist only in the test suite.

## Priority Levels

- 🔴 **CRITICAL**: Core business functionality, blocking user workflows
- 🟡 **HIGH**: Important for user experience and feature completeness
- 🟢 **MEDIUM**: Enhances UX but not blocking
- 🔵 **LOW**: Nice-to-have features

---

## 🔴 CRITICAL: File Operations (Core Business Logic)

### 1. Implement Real File Upload in Envelope Creation

**Status:** ❌ Not Implemented
**Current:** Mock data in `RecipientsSection`, TODO comments in `CreateEnvelopePage`
**Target:** `packages/client/src/pages/dashboard/envelope/create/create/index.tsx`

**Tasks:**

- [ ] Replace `toDataUrl()` logic with actual `uploadFile` SDK call
- [ ] Handle file encryption and storage via SDK
- [ ] Add proper error handling for upload failures
- [ ] Show upload progress indicators
- [ ] Implement file validation (size, type, etc.)

### 2. Implement File Download/Viewing

**Status:** ❌ Not Implemented
**Current:** Mock data in `DocumentAllPage`, `FileCard` components
**Target:** `packages/client/src/pages/dashboard/document/all/index.tsx`

**Tasks:**

- [ ] Replace mock data with `getSentFiles` and `getReceivedFiles` SDK calls
- [ ] Implement real file decryption and download
- [ ] Add file acknowledgment workflow for received files
- [ ] Handle file metadata display (sender, timestamp, status)

### 3. Implement File Acknowledgment

**Status:** ❌ Not Implemented
**Current:** Test suite only
**Target:** New component in file viewer/download flow

**Tasks:**

- [ ] Create acknowledgment UI for received files
- [ ] Integrate `acknowledgeFile` SDK mutation
- [ ] Add blockchain transaction confirmation
- [ ] Update file status in real-time

---

## 🟡 HIGH: Profile Management

### 4. Implement User Profile Creation

**Status:** ❌ Not Implemented
**Current:** Mock data in `ProfilePage`
**Target:** `packages/client/src/pages/dashboard/profile/index.tsx`

**Tasks:**

- [ ] Replace mock data with real SDK queries (`checkProfileExists`, `getProfile`)
- [ ] Implement `createProfile` mutation for new users
- [ ] Add username availability checking
- [ ] Handle profile creation errors and validation

### 5. Implement Profile Updates

**Status:** ❌ Not Implemented
**Current:** Form sections exist but use mock data
**Target:** Profile page sections

**Tasks:**

- [ ] Connect `PersonalInfoSection` to `updateProfile` mutation
- [ ] Add avatar upload with `useFileUpload` hook
- [ ] Implement bio and metadata updates
- [ ] Add real-time profile data fetching

### 6. Implement PIN Change Functionality

**Status:** ❌ Not Implemented
**Current:** UI exists but not connected
**Target:** `PinChangeSection.tsx`

**Tasks:**

- [ ] Create PIN change mutation (SDK doesn't have this - may need to add)
- [ ] Implement PIN validation and confirmation flow
- [ ] Add security warnings and rate limiting

---

## 🟢 MEDIUM: Complete Sharing Flow

### 7. Implement Share Request Acceptance

**Status:** ❌ Not Implemented
**Current:** Can send requests, but no acceptance UI
**Target:** New component or notification system

**Tasks:**

- [ ] Create UI for received share requests (`getReceivedRequests`)
- [ ] Implement `allowSharing` mutation for accepting requests
- [ ] Add request rejection/ignoring functionality
- [ ] Show request status (pending/accepted/rejected)

### 8. Implement Share Request Management

**Status:** ❌ Not Implemented
**Current:** Send requests work, but no management
**Target:** Profile or settings page

**Tasks:**

- [ ] Add UI to view sent requests (`getSentRequests`)
- [ ] Implement `cancelShareRequest` functionality
- [ ] Show request status and timestamps
- [ ] Add request history and filtering

### 9. Enhance Recipient Selection

**Status:** 🟡 Partially Implemented
**Current:** Basic recipient dropdown works
**Target:** `RecipientsSection.tsx`

**Tasks:**

- [ ] Add recipient search/filtering
- [ ] Show recipient profiles and trust status
- [ ] Add bulk recipient selection
- [ ] Improve recipient validation

---

## 🟢 MEDIUM: Signature Management

### 10. Connect Signature Creation to Documents

**Status:** ❌ Not Implemented
**Current:** Signature creation exists but not connected to signing
**Target:** Envelope creation and signing flow

**Tasks:**

- [ ] Integrate signature selection in document signing
- [ ] Add signature placement UI (drag/drop on documents)
- [ ] Implement document signing workflow
- [ ] Add signature verification display

### 11. Implement Signature Library

**Status:** ❌ Not Implemented
**Current:** Creation UI exists but no management
**Target:** New signature management page

**Tasks:**

- [ ] Create signature library page
- [ ] Implement `getSignatures` query
- [ ] Add `deleteSignature` functionality
- [ ] Add signature preview and editing

---

## 🔵 LOW: UI/UX Enhancements

### 12. Add Real-time Status Updates

**Status:** ❌ Not Implemented
**Current:** Manual refresh required
**Target:** All SDK-integrated components

**Tasks:**

- [ ] Implement React Query cache invalidation
- [ ] Add real-time updates for file statuses
- [ ] Add notification system for share requests
- [ ] Implement optimistic updates where appropriate

### 13. Improve Error Handling

**Status:** 🟡 Basic Implementation
**Current:** Console logging only
**Target:** All SDK mutation components

**Tasks:**

- [ ] Add user-friendly error messages
- [ ] Implement retry mechanisms for failed operations
- [ ] Add network status indicators
- [ ] Create error boundary components

### 14. Add Loading States

**Status:** 🟡 Partially Implemented
**Current:** Basic spinners exist
**Target:** All async operations

**Tasks:**

- [ ] Add skeleton loading for lists
- [ ] Implement progressive loading for large datasets
- [ ] Add loading states for file operations
- [ ] Create consistent loading patterns

---

## 🔧 INFRASTRUCTURE: Testing & Validation

### 15. Update Test Suite

**Status:** ✅ Exists but needs updates
**Current:** Test suite works but may be outdated
**Target:** `packages/client/src/pages/test/`

**Tasks:**

- [ ] Update test components with new implementations
- [ ] Add integration tests for new features
- [ ] Test edge cases and error scenarios
- [ ] Validate SDK version compatibility

### 16. Add E2E Testing

**Status:** ❌ Not Implemented
**Current:** No E2E tests
**Target:** New test files

**Tasks:**

- [ ] Create end-to-end test scenarios
- [ ] Test complete user workflows
- [ ] Validate file upload/download cycles
- [ ] Test sharing and permission flows

---

## 📋 IMPLEMENTATION GUIDELINES

### Code Patterns to Follow

- Use `useFilosignQuery` for read operations, `useFilosignMutation` for writes
- Implement proper error handling with user-friendly messages
- Add loading states and skeleton screens
- Use React Query for caching and invalidation
- Follow existing Shadcn UI patterns

### SDK Query Key Structure

- Auth: `["isRegistered"]`, `["isLoggedIn"]`
- Files: `["files", "uploadFile"]`, `["files", "getSentFiles"]`
- Profiles: `["profile", "getProfile"]`, `["profile", "createProfile"]`
- Sharing: `["shareCapability", "sendShareRequest"]`
- Signatures: `["signatures", "uploadSignature"]`

### File Structure Changes Needed

```
pages/dashboard/
├── files/           # Update with real SDK integration
├── profile/         # Implement real profile management
├── envelope/        # Connect to file operations
└── signatures/      # New signature library page
```

### Dependencies

1. File operations must be complete before signature workflows
2. Profile management should be done before advanced sharing
3. Sharing flow should be complete before user acquisition focus
4. Testing should validate all implementations

---

## 🎯 SUCCESS METRICS

- [ ] Users can upload and download real files
- [ ] Complete document signing workflow works
- [ ] User profiles are fully functional
- [ ] Sharing requests have full acceptance flow
- [ ] All test suite components work in production
- [ ] Error handling provides clear user feedback
- [ ] Loading states prevent user confusion
- [ ] Real-time updates work across the app
