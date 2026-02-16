/**
 * Represents a message with both Arabic and English translations.
 * Arabic is the primary language as per application requirements.
 */
export interface LocalizedMessage {
    /** The Arabic text of the message (primary language) */
    ar: string;
    /** The English text of the message */
    en: string;
}

/**
 * Standardized API response wrapper with bilingual message support.
 * All API responses should use this format for consistency.
 */
export interface ApiResponse<T> {
    /** Indicates whether the operation was successful */
    success: boolean;
    /** The data payload of the response (null if unsuccessful) */
    data?: T | null;
    /** Success message with Arabic and English translations */
    message?: LocalizedMessage | null;
    /** Error message with Arabic and English translations (null if successful) */
    error?: LocalizedMessage | null;
    /** Validation errors with field names as keys and bilingual messages as values */
    validationErrors?: Record<string, LocalizedMessage> | null;
    /** HTTP status code for the response */
    statusCode: number;
    /** Timestamp of the response */
    timestamp: string;
}

/**
 * Non-generic version of ApiResponse for operations that don't return data.
 */
export type ApiResponseVoid = ApiResponse<void>;

/**
 * Helper type for extracting the data type from an ApiResponse.
 */
export type ExtractApiResponseData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * Helper type for paginated responses.
 */
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

/**
 * Combined type for paginated API response.
 */
export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>;