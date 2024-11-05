Electronic Gatepass Workflow

    Guard at Truck Gate:
        Enter Details: The guard inputs driver and truck details into the electronic system upon arrival.
        Generate Form Number: The system generates a unique form number for each entry, which is printed on a ticket or slip and given to the driver.
        Driver Proceeds to Dispatch: The driver carries the form number to the dispatch office to retrieve their information.

    Dispatch Verification:
        Retrieve Driver Information: The driver presents the form number to dispatch, who uses it to pull up the driver's information in the system.
        Verification: Dispatch verifies the driver's details against the Bill of Lading (BOL), trailer number, and driver name to confirm accuracy.
        Status Update: System updates status to BOL_VERIFIED.
        Check-In: Dispatch checks the truck into the yard management system, updating status to CHECKED_IN.
        Electronic Signature on SigPad: Dispatch may request the driver's electronic signature on a signature pad to confirm information and completion of check-in.

    Live Load Pickup (if applicable):
        Yard Entry: Once checked in, status updates to IN_YARD.
        Assign Pickup Door: For live loads, dispatch assigns a pickup door within the system. Status updates to AT_DOOR.
        Loading Process: When loading begins, status updates to LOADING.
        Driver Confirmation: The driver confirms the pickup assignment and proceeds to the assigned door.

    Warehouse Document and Seal Handling:
        Seal Assignment:
            When loading is complete, status updates to AWAITING_SEAL.
            Warehouse assigns seal number(s) to the truck.
            After seal assignment, status updates to AWAITING_DOCS.

        Document Transfer:
            Document Preparation: The warehouse prepares shipping documents.
            Driver's Physical Signature: The driver signs the physical shipping documents as required.
            Document Transfer: Warehouse marks documents as transferred in the system.
            Status Update: System updates status to DOCS_TRANSFERRED.

        Completion:
            When both seals are assigned and documents are transferred, status updates to COMPLETED.

    Release and Exit:
        Guard Verification:
            When the driver exits, the guard uses the form number to retrieve exit requirements.
            Guard verifies:
                - Trailer number
                - Seal numbers match
                - All documents are transferred
                - All signatures are collected
            Electronic Signature: Guard captures final signature confirming exit verification.
            Status Update: System updates status to EXITED.

Status Flow:
PENDING → BOL_VERIFIED → CHECKED_IN → IN_YARD → AT_DOOR → LOADING →
AWAITING_SEAL → AWAITING_DOCS → DOCS_TRANSFERRED → COMPLETED → EXITED

    Note: Status can be changed to CANCELLED at any point if needed.

Summary of Key Points:

    Sequential Status Flow: Each step in the process corresponds to a specific status update.
    Dual Requirements: Both seals and documents must be processed before completion.
    Electronic Signatures: Captured at key points in the workflow.
    Physical Documents: Shipping documents require physical signatures but are tracked electronically.
    Exit Verification: Final check of all requirements before truck leaves facility.
