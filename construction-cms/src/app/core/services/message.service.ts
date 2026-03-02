import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedMessage, ApiResponse } from '../models/api-response.models';

/**
 * Service for extracting localized messages from API responses.
 * Handles bilingual (Arabic/English) message extraction based on current language.
 * English is the primary language as per application requirements.
 */
@Injectable({
    providedIn: 'root'
})
export class MessageService {
    private readonly translate = inject(TranslateService);

    /**
     * Gets the current language code from the translate service.
     * Defaults to 'en' (English) if not set.
     */
    get currentLanguage(): string {
        return this.translate.currentLang || this.translate.defaultLang || 'en';
    }

    /**
     * Extracts the appropriate language message from a LocalizedMessage.
     * Defaults to Arabic if the language is not found.
     * 
     * @param message The localized message containing Arabic and English text
     * @returns The message in the current language, or Arabic as fallback
     */
    getMessage(message: LocalizedMessage | null | undefined): string {
        if (!message) {
            return '';
        }

        // Arabic is the primary language, so it's always available
        const lang = this.currentLanguage.toLowerCase();

        if (lang === 'en' && message.en) {
            return message.en;
        }

        // Default to Arabic (primary language)
        return message.ar || message.en || '';
    }

    /**
     * Extracts the success message from an API response.
     * 
     * @param response The API response
     * @returns The success message in the current language, or empty string
     */
    getSuccessMessage<T>(response: ApiResponse<T> | null | undefined): string {
        if (!response || !response.success || !response.message) {
            return '';
        }
        return this.getMessage(response.message);
    }

    /**
     * Extracts the error message from an API response.
     * 
     * @param response The API response
     * @returns The error message in the current language, or empty string
     */
    getErrorMessage<T>(response: ApiResponse<T> | null | undefined): string {
        if (!response || response.success || !response.error) {
            return '';
        }
        return this.getMessage(response.error);
    }

    /**
     * Extracts validation errors from an API response.
     * 
     * @param response The API response
     * @returns A record of field names to error messages in the current language
     */
    getValidationErrors<T>(response: ApiResponse<T> | null | undefined): Record<string, string> {
        if (!response || response.success || !response.validationErrors) {
            return {};
        }

        const result: Record<string, string> = {};
        for (const [field, message] of Object.entries(response.validationErrors)) {
            result[field] = this.getMessage(message);
        }
        return result;
    }

    /**
     * Gets all error messages (general + validation) as an array.
     * Useful for displaying all errors in a list.
     * 
     * @param response The API response
     * @returns Array of error messages in the current language
     */
    getAllErrorMessages<T>(response: ApiResponse<T> | null | undefined): string[] {
        const errors: string[] = [];

        // Add general error message
        const generalError = this.getErrorMessage(response);
        if (generalError) {
            errors.push(generalError);
        }

        // Add validation errors
        const validationErrors = this.getValidationErrors(response);
        for (const message of Object.values(validationErrors)) {
            if (message && !errors.includes(message)) {
                errors.push(message);
            }
        }

        return errors;
    }

    /**
     * Creates a LocalizedMessage with the same text for both languages.
     * Useful for development or when translation is not yet available.
     * 
     * @param text The text to use for both languages
     * @returns A LocalizedMessage with the same text for both languages
     */
    createSameMessage(text: string): LocalizedMessage {
        return { ar: text, en: text };
    }

    /**
     * Creates a LocalizedMessage with different Arabic and English texts.
     * 
     * @param ar Arabic text (primary)
     * @param en English text
     * @returns A LocalizedMessage with both translations
     */
    createMessage(ar: string, en: string): LocalizedMessage {
        return { ar, en };
    }

    /**
     * Checks if a response indicates success.
     * 
     * @param response The API response
     * @returns True if the response is successful
     */
    isSuccess<T>(response: ApiResponse<T> | null | undefined): boolean {
        return response?.success ?? false;
    }

    /**
     * Checks if a response indicates failure.
     * 
     * @param response The API response
     * @returns True if the response is a failure
     */
    isFailure<T>(response: ApiResponse<T> | null | undefined): boolean {
        return !this.isSuccess(response);
    }

    /**
     * Checks if a response has validation errors.
     * 
     * @param response The API response
     * @returns True if the response has validation errors
     */
    hasValidationErrors<T>(response: ApiResponse<T> | null | undefined): boolean {
        return !!(response?.validationErrors && Object.keys(response.validationErrors).length > 0);
    }

    /**
     * Gets a human-readable summary of the response status.
     * Useful for logging or debugging.
     * 
     * @param response The API response
     * @returns A summary string
     */
    getSummary<T>(response: ApiResponse<T> | null | undefined): string {
        if (!response) {
            return 'No response';
        }

        const parts: string[] = [];
        parts.push(`Status: ${response.success ? 'Success' : 'Failed'}`);
        parts.push(`Code: ${response.statusCode}`);

        if (response.message) {
            parts.push(`Message: ${this.getMessage(response.message)}`);
        }

        if (response.error) {
            parts.push(`Error: ${this.getMessage(response.error)}`);
        }

        if (response.validationErrors) {
            parts.push(`Validation Errors: ${Object.keys(response.validationErrors).length}`);
        }

        return parts.join(' | ');
    }
}