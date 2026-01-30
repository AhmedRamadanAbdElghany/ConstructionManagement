public record ReviewMediaRequest(
    string Status,              // "Approved", "Rejected", "Forwarded"
    string? RejectionReason,    // سبب الرفض النصي (اختياري)
    string RejectionType,       // ← جديد: "WorkQuality" أو "ImageClarity" أو null
    int? ForwardToUserID = null
    // NOTE: Add tests for RejectionType + Status combinations.
);
