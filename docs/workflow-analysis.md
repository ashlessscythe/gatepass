# Gatepass Workflow Analysis

## Current Use Case

This system handles **drivers via gatepasses** to:

- Ensure drivers go to **correct door**
- Ensure drivers get **correct paperwork**
- Ensure drivers get **correct material loaded**
- **Avoid drivers going into warehouse** (they stay outside, clerks handle everything)

**Users:**

- **Drivers/Dispatchers**: View door assignments, sign documents
- **Clerks**: Handle paperwork, loading, seals
- **Guards**: Entry/exit verification

## Issues with Current Workflow

### 1. **IN_YARD Status is Unnecessary**

**Problem:** The system has an `IN_YARD` status, but you mentioned this doesn't manage yard movements.

**Current Flow:**

```
CHECKED_IN → IN_YARD → AT_DOOR
```

**Issue:** The `assign-door` endpoint actually allows going directly from `BOL_VERIFIED` or `CHECKED_IN` to `AT_DOOR`, skipping `IN_YARD`. This creates confusion.

**Recommendation:** Remove `IN_YARD` status. After dispatch verifies BOL and assigns door, driver goes directly to door.

### 2. **CHECKED_IN vs BOL_VERIFIED Redundancy**

**Problem:** Both statuses seem to represent the same thing - dispatch verifying the driver.

**Current Flow:**

```
PENDING → BOL_VERIFIED → CHECKED_IN → ...
```

**Issue:** If dispatch verifies BOL, the driver is essentially checked in. Having both is redundant.

**Recommendation:** Merge into single status: `BOL_VERIFIED` (which implies driver is checked in).

### 3. **Door Assignment Flow Inconsistency**

**Problem:**

- Status management says: `ASSIGN_DOOR` should go from `IN_YARD` to `AT_DOOR`
- But API allows: `BOL_VERIFIED` or `CHECKED_IN` → `AT_DOOR`

**Recommendation:** Fix the flow to be:

```
BOL_VERIFIED → AT_DOOR (when dispatch assigns door)
```

### 4. **Overly Complex Loading Flow**

**Problem:** Too many intermediate states for what should be simple:

- Driver at door
- Loading happens
- Paperwork and seals handled
- Done

**Current Flow:**

```
AT_DOOR → LOADING → AWAITING_SEAL → AWAITING_DOCS → DOCS_TRANSFERRED → COMPLETED
```

**Issue:** This is too granular. The system should focus on:

- ✅ Driver at correct door
- ✅ Loading in progress
- ✅ Paperwork/seals ready
- ✅ Complete

**Recommendation:** Simplify to:

```
AT_DOOR → LOADING → AWAITING_DOCS → COMPLETED
```

Where:

- `LOADING`: Material is being loaded
- `AWAITING_DOCS`: Waiting for paperwork/seals (can happen in parallel)
- `COMPLETED`: Everything ready (seals assigned, docs transferred, signatures collected)

### 5. **Missing Clear Role Responsibilities**

**Problem:** The workflow doesn't clearly show who does what.

**Recommendation:** Document clear responsibilities:

- **Guard**: Creates gatepass (PENDING), verifies exit (EXITED)
- **Dispatch**: Verifies BOL, assigns door (BOL_VERIFIED → AT_DOOR)
- **Clerks/Warehouse**: Handle loading, paperwork, seals (LOADING → AWAITING_DOCS → COMPLETED)
- **Driver**: Views door assignment, signs documents (passive participant)

## Proposed Simplified Workflow

```
PENDING (Guard creates gatepass)
  ↓
BOL_VERIFIED (Dispatch verifies BOL - driver checked in)
  ↓
AT_DOOR (Dispatch assigns door - driver goes to door)
  ↓
LOADING (Clerks start loading material)
  ↓
AWAITING_DOCS (Loading done, waiting for paperwork/seals)
  ↓
COMPLETED (Paperwork ready, seals assigned, signatures collected)
  ↓
EXITED (Guard verifies exit)
```

### Status Definitions:

1. **PENDING**: Guard created gatepass, driver hasn't reached dispatch yet
2. **BOL_VERIFIED**: Dispatch verified BOL, driver checked in, ready for door assignment
3. **AT_DOOR**: Dispatch assigned door, driver at correct door
4. **LOADING**: Material is being loaded by clerks
5. **AWAITING_DOCS**: Loading complete, waiting for paperwork/seals from clerks
6. **COMPLETED**: All paperwork ready, seals assigned, driver signed - ready to exit
7. **EXITED**: Guard verified exit, truck left facility
8. **CANCELLED**: Gatepass cancelled at any point

### Key Simplifications:

- ❌ Remove `IN_YARD` (not managing yard movements)
- ❌ Remove `CHECKED_IN` (redundant with BOL_VERIFIED)
- ❌ Remove `AWAITING_SEAL` (seals can be assigned during AWAITING_DOCS)
- ❌ Remove `DOCS_TRANSFERRED` (if docs are transferred, we're COMPLETED)

### Role Actions:

- **Guard**: PENDING → (creates), EXITED → (verifies exit)
- **Dispatch**: PENDING → BOL_VERIFIED (verify BOL), BOL_VERIFIED → AT_DOOR (assign door)
- **Clerks/Warehouse**: AT_DOOR → LOADING (start loading), LOADING → AWAITING_DOCS (loading done), AWAITING_DOCS → COMPLETED (paperwork/seals ready)
- **Driver**: Views door assignment, signs when requested

## Implementation Changes Needed

1. **Update Status Enum**: Remove `IN_YARD`, `CHECKED_IN`, `AWAITING_SEAL`, `DOCS_TRANSFERRED`
2. **Update Status Transitions**: Simplify to new flow
3. **Update Assign Door API**: Should go from `BOL_VERIFIED` directly to `AT_DOOR`
4. **Update Warehouse APIs**:
   - Seal assignment should work from `LOADING` or `AWAITING_DOCS`
   - Document transfer should move to `COMPLETED` (not `DOCS_TRANSFERRED`)
5. **Update Yard Check-in API**: Remove or repurpose (not managing yard movements)
6. **Update Status Management**: Fix all transition rules
