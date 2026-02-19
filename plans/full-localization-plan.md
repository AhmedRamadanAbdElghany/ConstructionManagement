

Components that fetch localized data from backend must refresh on language change.

## Estimated Effort

This is a significant undertaking that requires:
- Systematic review of all 60+ components
- Translation file updates for each feature
- Testing across all pages in both languages
- Backend API review for localization support

## Next Steps

1. Start with high-priority components (Auth, Dashboard, Projects, HR)
2. Create a shared translation key library for common terms
3. Implement component-by-component, testing as we go
4. Document patterns for future development
