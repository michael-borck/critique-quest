# Import/Export Enhancement Plan (Development Phase)

## Current State Analysis
- ✅ Export backend supports: PDF, Word, HTML, Text
- ❌ Missing: JSON export format
- ✅ Basic import exists (JSON + text fallback)
- ❌ UI only exports PDF (no format selection)
- ❌ No URL import capability
- ❌ No markdown parsing/rendering

## Proposed Enhancements (No Backward Compatibility Needed)

### 1. JSON Export/Import (Priority 1)
- Add `exportToJSON()` method in FileService
- Export complete CaseStudy object with metadata
- Update import to properly validate JSON structure
- Add format selection UI in LibraryView

### 2. Enhanced Export UI (Priority 1)
- Add format dropdown: PDF, Word, HTML, Text, JSON, Markdown
- Replace hardcoded PDF export with format selection
- Add export options/preferences

### 3. Markdown Support (Priority 2)
- Install `marked` or `react-markdown`
- Add markdown export format
- Add markdown rendering in case display
- Support for headers, lists, emphasis, code blocks

### 4. URL Import (Priority 2)
- Add URL input field in import interface
- Fetch and validate remote JSON files
- Basic security validation (HTTPS, file size limits)
- Error handling for network issues

### 5. Import UI Improvements (Priority 3)
- File picker for local JSON files
- URL input for remote imports
- Drag & drop support
- Import validation feedback

### 6. Bulk Operations (Priority 3)
- Multi-select cases for bulk export
- Export multiple cases as JSON collection
- Bulk import from JSON collections

## Implementation Tasks (Todo List)
1. Add JSON export method to FileService
2. Add markdown export method to FileService
3. Update export UI with format selection
4. Install markdown parser dependency
5. Add markdown rendering to case display
6. Add URL import functionality
7. Create import UI with file picker and URL input
8. Add drag & drop import support
9. Add bulk export functionality
10. Add bulk import for collections

## Technical Notes
- No backward compatibility constraints
- Can refactor existing code freely
- Focus on clean, modern implementation
- Prioritize user experience over legacy support

---
*Plan created: 2025-06-16*
*Status: Ready for implementation*