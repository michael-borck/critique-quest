# Open Source Acknowledgments

CritiqueQuest is built on the shoulders of giants. We are deeply grateful to the open source community and the following projects that make CritiqueQuest possible.

## Framework & Core Technologies

### [Electron](https://www.electronjs.org/) - MIT License
**Version**: 26.2.1  
**Purpose**: Cross-platform desktop application framework  
**Copyright**: Copyright (c) 2013-2020 GitHub Inc.

Electron enables us to build CritiqueQuest as a native desktop application using web technologies, providing a consistent experience across Windows, macOS, and Linux.

### [React](https://reactjs.org/) - MIT License
**Version**: 18.2.0  
**Purpose**: User interface library  
**Copyright**: Copyright (c) Meta Platforms, Inc. and affiliates.

React powers CritiqueQuest's interactive user interface, enabling efficient rendering and state management for a smooth educational experience.

### [TypeScript](https://www.typescriptlang.org/) - Apache 2.0 License
**Version**: 5.2.2  
**Purpose**: Type-safe JavaScript development  
**Copyright**: Copyright (c) Microsoft Corporation.

TypeScript ensures code quality and developer productivity through static type checking, reducing bugs and improving maintainability.

### [Node.js](https://nodejs.org/) - MIT License
**Purpose**: JavaScript runtime for the main process  
**Copyright**: Copyright Node.js contributors.

Node.js enables server-side JavaScript execution for CritiqueQuest's main process, file operations, and AI service integrations.

## User Interface & Styling

### [Material-UI (MUI)](https://mui.com/) - MIT License
**Version**: 5.14.11  
**Purpose**: React component library  
**Copyright**: Copyright (c) 2014 Call-Em-All

- `@mui/material` - Core Material Design components
- `@mui/icons-material` - Material Design icons

MUI provides CritiqueQuest's professional, accessible interface components following Material Design principles.

### [Emotion](https://emotion.sh/) - MIT License
**Version**: 11.11.1  
**Purpose**: CSS-in-JS styling library  
**Copyright**: Copyright (c) Emotion team and other contributors

- `@emotion/react` - Core CSS-in-JS functionality  
- `@emotion/styled` - Styled component utilities

Emotion enables dynamic styling and theming capabilities in CritiqueQuest's interface.

## State Management & Data Handling

### [Zustand](https://github.com/pmndrs/zustand) - MIT License
**Version**: 4.4.1  
**Purpose**: Lightweight state management  
**Copyright**: Copyright (c) 2019 Paul Henschel

Zustand manages CritiqueQuest's application state with minimal boilerplate, providing efficient updates and persistence.

### [node-json-db](https://github.com/Belphemur/node-json-db) - MIT License
**Version**: 2.3.0  
**Purpose**: Local JSON database  
**Copyright**: Copyright (c) 2016 Belphemur

Enables CritiqueQuest to store case studies, collections, and user preferences locally without requiring external database setup.

### [electron-store](https://github.com/sindresorhus/electron-store) - MIT License
**Version**: 8.1.0  
**Purpose**: Electron settings storage  
**Copyright**: Copyright (c) Sindre Sorhus

Provides secure, cross-platform storage for user preferences and application settings.

## AI & HTTP Communication

### [OpenAI SDK](https://github.com/openai/openai-node) - MIT License
**Version**: 4.11.1  
**Purpose**: OpenAI API integration  
**Copyright**: Copyright (c) 2022 OpenAI

Enables integration with OpenAI's GPT models for case study generation and AI-powered features.

### [Axios](https://axios-http.com/) - MIT License
**Version**: 1.5.0  
**Purpose**: HTTP client library  
**Copyright**: Copyright (c) 2014-present Matt Zabriskie

Provides reliable HTTP communication for AI service integrations and external API calls.

## Text Processing & Document Handling

### [html-to-text](https://github.com/html-to-text/node-html-to-text) - MIT License
**Version**: 9.0.5  
**Purpose**: HTML to plain text conversion  
**Copyright**: Copyright (c) 2011-2021 html-to-text contributors

Enables clean text extraction from HTML content for text analysis and export features.

### [react-markdown](https://github.com/remarkjs/react-markdown) - MIT License
**Version**: 10.1.0  
**Purpose**: Markdown rendering in React  
**Copyright**: Copyright (c) 2015 Espen Hovlandsdal

Provides beautiful markdown rendering for case study content and documentation display.

### [rehype-highlight](https://github.com/rehypejs/rehype-highlight) - MIT License
**Version**: 7.0.2  
**Purpose**: Code syntax highlighting  
**Copyright**: Copyright (c) 2016 Titus Wormer

Adds syntax highlighting to code blocks in markdown content.

## Document Export & Generation

### [jsPDF](https://github.com/parallax/jsPDF) - MIT License
**Version**: 2.5.1  
**Purpose**: PDF generation  
**Copyright**: Copyright (c) 2010-2021 James Hall

Enables high-quality PDF export of case studies for printing and distribution.

### [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - BSD 2-Clause License
**Version**: 1.6.0  
**Purpose**: Word document processing  
**Copyright**: Copyright (c) 2013, Michael Williamson

Provides Word document import/export capabilities for educational content workflows.

## Development & Build Tools

### [Vite](https://vitejs.dev/) - MIT License
**Version**: 4.4.9  
**Purpose**: Frontend build tool  
**Copyright**: Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Provides fast development server and optimized production builds for the renderer process.

### [electron-builder](https://www.electron.build/) - MIT License
**Version**: 24.6.4  
**Purpose**: Application packaging and distribution  
**Copyright**: Copyright (c) 2015 Loopline Systems

Enables cross-platform packaging and distribution of CritiqueQuest desktop applications.

### [ESLint](https://eslint.org/) - MIT License
**Version**: 8.50.0  
**Purpose**: JavaScript/TypeScript linting  
**Copyright**: Copyright OpenJS Foundation and other contributors

Maintains code quality and consistency across the CritiqueQuest codebase.

### [Concurrently](https://github.com/open-cli-tools/concurrently) - MIT License
**Version**: 8.2.2  
**Purpose**: Running multiple npm scripts  
**Copyright**: Copyright (c) 2022 Kimmo Brunfeldt and other contributors

Enables parallel execution of development processes for efficient development workflow.

## Additional Dependencies

### TypeScript Type Definitions
- `@types/node` - MIT License - Node.js type definitions
- `@types/react` - MIT License - React type definitions  
- `@types/react-dom` - MIT License - React DOM type definitions

### React Plugins and Extensions
- `@vitejs/plugin-react` - MIT License - Vite React plugin
- `eslint-plugin-react` - MIT License - ESLint React rules
- `eslint-plugin-react-hooks` - MIT License - ESLint React Hooks rules
- `@typescript-eslint/eslint-plugin` - MIT License - TypeScript ESLint plugin
- `@typescript-eslint/parser` - MIT License - TypeScript ESLint parser

## License Compliance

All dependencies are used in compliance with their respective licenses. CritiqueQuest is released under the MIT License, which is compatible with all included dependencies.

## Contributing to Dependencies

We encourage users and developers to contribute back to the open source projects that make CritiqueQuest possible:

- **Report bugs** and submit feature requests to upstream projects
- **Contribute code** improvements and fixes
- **Support maintenance** through sponsorship or donations where applicable
- **Spread awareness** of these excellent open source tools

## Staying Updated

This acknowledgment file is maintained alongside CritiqueQuest's development. For the most current list of dependencies and their versions, please refer to:

- [`package.json`](package.json) - Current dependency versions
- [`package-lock.json`](package-lock.json) - Exact dependency tree

## Thank You

The open source community's dedication to creating and maintaining these tools enables educational software like CritiqueQuest to exist and thrive. We are honored to build upon this foundation and contribute back to the ecosystem through CritiqueQuest's open source release.

---

*Last updated: December 2024*  
*For updates to this acknowledgment, please see the project's [GitHub repository](https://github.com/michael-borck/critquie-quest).*