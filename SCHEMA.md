# Cosmos Firestore Database Schema

This document describes the recommended Firestore collections and document structure for the Cosmos application.

---

## users
- `uid` (string, Firebase Auth UID)
- `email` (string)
- `role` (string, e.g., "admin" or "user")
- `displayName` (string)

---

## investments
- `name` (string)
- `description` (string)
- `amount` (number)
- `investmentDate` (string, ISO date)
- `status` (string, e.g., "active")
- `ownerId` (string, reference to users.uid)

---

## operatingCompanies
- `name` (string)
- `investmentId` (string, reference to investments)
- `metrics` (object, optional)

---

## financialData
- `companyId` (string, reference to operatingCompanies)
- `date` (string, ISO date)
- `revenue` (number)
- `ebitda` (number)
- `cashflow` (number)
- `headcount` (number)
- `arAging` (object: `{ current, 30, 60 }`)

---

## chat_history
- `userId` (string)
- `timestamp` (string, ISO date)
- `message` (string)
- `response` (string)

---

## email_history
- `userId` (string)
- `type` (string, e.g., "report")
- `content` (string)
- `timestamp` (string, ISO date)

---

> **Note:** Firestore is schema-less, but this structure is recommended for Cosmos. Enforce with validation and security rules as needed. 