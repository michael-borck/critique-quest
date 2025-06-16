import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { app, dialog } from 'electron';
import jsPDF from 'jspdf';
import axios from 'axios';
import type { CaseStudy, Collection, Bundle } from '../shared/types';

export class FileService {
  private getExportsPath(): string {
    const userDataPath = app.getPath('userData');
    return join(userDataPath, 'exports');
  }

  async exportCase(caseStudy: CaseStudy, format: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeTitle = caseStudy.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const filename = `${safeTitle}_${timestamp}`;

    switch (format.toLowerCase()) {
      case 'pdf':
        return this.exportToPDF(caseStudy, filename);
      case 'word':
      case 'docx':
        return this.exportToWord(caseStudy, filename);
      case 'html':
        return this.exportToHTML(caseStudy, filename);
      case 'text':
      case 'txt':
        return this.exportToText(caseStudy, filename);
      case 'json':
        return this.exportToJSON(caseStudy, filename);
      case 'markdown':
      case 'md':
        return this.exportToMarkdown(caseStudy, filename);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async exportToPDF(caseStudy: CaseStudy, filename: string): Promise<string> {
    const doc = new jsPDF();
    const margin = 20;
    const lineHeight = 10;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - 2 * margin);
      
      lines.forEach((line: string) => {
        if (yPosition > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += 5; // Extra spacing after sections
    };

    // Title
    addText(caseStudy.title, 18, true);
    yPosition += 5;

    // Metadata
    addText(`Domain: ${caseStudy.domain} | Complexity: ${caseStudy.complexity} | Type: ${caseStudy.scenario_type}`, 10);
    addText(`Word Count: ${caseStudy.word_count} words`, 10);
    yPosition += 10;

    // Content
    addText('Case Study', 14, true);
    addText(caseStudy.content);

    // Questions
    if (caseStudy.questions) {
      addText('Analysis Questions', 14, true);
      addText(caseStudy.questions);
    }

    // Answers if available
    if (caseStudy.answers) {
      addText('Model Answers', 14, true);
      addText(caseStudy.answers);
    }

    // Tags
    if (caseStudy.tags.length > 0) {
      addText('Tags', 14, true);
      addText(caseStudy.tags.join(', '));
    }

    const outputPath = join(this.getExportsPath(), `${filename}.pdf`);
    
    try {
      const pdfBuffer = doc.output('arraybuffer');
      writeFileSync(outputPath, Buffer.from(pdfBuffer));
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to export PDF: ${error}`);
    }
  }

  private async exportToHTML(caseStudy: CaseStudy, filename: string): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${caseStudy.title}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .metadata {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        .tags {
            margin-top: 10px;
        }
        .tag {
            display: inline-block;
            background: #ecf0f1;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-right: 5px;
        }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #34495e;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
        }
        .content {
            white-space: pre-wrap;
            text-align: justify;
        }
        @media print {
            body { margin: 0; padding: 15px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${caseStudy.title}</h1>
        <div class="metadata">
            <strong>Domain:</strong> ${caseStudy.domain} | 
            <strong>Complexity:</strong> ${caseStudy.complexity} | 
            <strong>Type:</strong> ${caseStudy.scenario_type}
        </div>
        <div class="metadata">
            <strong>Word Count:</strong> ${caseStudy.word_count} words
        </div>
        <div class="tags">
            ${caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    </div>
    
    <div class="section">
        <h2>Case Study</h2>
        <div class="content">${caseStudy.content}</div>
    </div>
    
    ${caseStudy.questions ? `
    <div class="section">
        <h2>Analysis Questions</h2>
        <div class="content">${caseStudy.questions}</div>
    </div>
    ` : ''}
    
    ${caseStudy.answers ? `
    <div class="section">
        <h2>Model Answers</h2>
        <div class="content">${caseStudy.answers}</div>
    </div>
    ` : ''}
    
    <div class="footer" style="margin-top: 40px; text-align: center; color: #999; font-size: 0.8em;">
        Generated by CritiqueQuest
    </div>
</body>
</html>`;

    const outputPath = join(this.getExportsPath(), `${filename}.html`);
    writeFileSync(outputPath, html, 'utf8');
    return outputPath;
  }

  private async exportToWord(caseStudy: CaseStudy, filename: string): Promise<string> {
    // For a simple implementation, we'll create an RTF file which can be opened by Word
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${caseStudy.title}\\par
\\par
Domain: ${caseStudy.domain}\\par
Complexity: ${caseStudy.complexity}\\par
Type: ${caseStudy.scenario_type}\\par
Word Count: ${caseStudy.word_count}\\par
\\par
{\\b Case Study}\\par
${caseStudy.content.replace(/\n/g, '\\par ')}\\par
\\par
${caseStudy.questions ? `{\\b Analysis Questions}\\par ${caseStudy.questions.replace(/\n/g, '\\par ')}\\par \\par` : ''}
${caseStudy.answers ? `{\\b Model Answers}\\par ${caseStudy.answers.replace(/\n/g, '\\par ')}\\par \\par` : ''}
${caseStudy.tags.length > 0 ? `{\\b Tags}\\par ${caseStudy.tags.join(', ')}\\par` : ''}
}`;

    const outputPath = join(this.getExportsPath(), `${filename}.rtf`);
    writeFileSync(outputPath, rtfContent, 'utf8');
    return outputPath;
  }

  private async exportToText(caseStudy: CaseStudy, filename: string): Promise<string> {
    const textContent = `${caseStudy.title}
${'='.repeat(caseStudy.title.length)}

Domain: ${caseStudy.domain}
Complexity: ${caseStudy.complexity}
Type: ${caseStudy.scenario_type}
Word Count: ${caseStudy.word_count}
Tags: ${caseStudy.tags.join(', ')}

CASE STUDY
----------
${caseStudy.content}

${caseStudy.questions ? `ANALYSIS QUESTIONS\n------------------\n${caseStudy.questions}\n\n` : ''}
${caseStudy.answers ? `MODEL ANSWERS\n-------------\n${caseStudy.answers}\n\n` : ''}

Generated by CritiqueQuest`;

    const outputPath = join(this.getExportsPath(), `${filename}.txt`);
    writeFileSync(outputPath, textContent, 'utf8');
    return outputPath;
  }

  async importCase(filePath: string): Promise<CaseStudy> {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      // Try to parse as JSON first (our export format)
      try {
        const parsed = JSON.parse(content);
        if (parsed.title && parsed.content) {
          return parsed as CaseStudy;
        }
      } catch {
        // Not JSON, treat as plain text
      }

      // Parse as plain text case study
      const lines = content.split('\n');
      const title = lines[0] || 'Imported Case Study';
      
      return {
        title,
        domain: 'Imported',
        complexity: 'Intermediate',
        scenario_type: 'Problem-solving',
        content: content,
        questions: '',
        tags: ['imported'],
        is_favorite: false,
        word_count: content.split(' ').length,
        usage_count: 0,
      };
    } catch (error) {
      throw new Error(`Failed to import case study: ${error}`);
    }
  }

  async importCaseFromURL(url: string): Promise<CaseStudy> {
    try {
      // Validate URL
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      // Fetch content with timeout and size limits
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        maxContentLength: 10 * 1024 * 1024, // 10MB limit
        maxBodyLength: 10 * 1024 * 1024,
        headers: {
          'User-Agent': 'CritiqueQuest/1.0',
          'Accept': 'application/json, text/plain, */*',
        },
      });

      // Validate content type
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/json') && !contentType.includes('text/')) {
        throw new Error('URL must return JSON or text content');
      }

      let content = response.data;
      
      // If response is not already parsed as JSON, try to parse it
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch {
          // Not JSON, treat as plain text - use existing logic
          const lines = content.split('\n');
          const title = lines[0] || 'Imported Case Study from URL';
          
          return {
            title,
            domain: 'General',
            complexity: 'Intermediate' as const,
            scenario_type: 'Problem-solving' as const,
            content: content,
            questions: '',
            tags: ['imported', 'url'],
            is_favorite: false,
            word_count: content.split(' ').length,
            usage_count: 0,
          };
        }
      }

      // Validate JSON structure
      if (!content.title || !content.content) {
        throw new Error('Invalid case study format: missing required fields (title, content)');
      }

      // Clean and validate the imported data
      const caseStudy: CaseStudy = {
        title: String(content.title),
        domain: String(content.domain || 'General'),
        complexity: ['Beginner', 'Intermediate', 'Advanced'].includes(content.complexity) 
          ? content.complexity 
          : 'Intermediate',
        scenario_type: ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'].includes(content.scenario_type)
          ? content.scenario_type
          : 'Problem-solving',
        content: String(content.content),
        questions: String(content.questions || ''),
        answers: content.answers ? String(content.answers) : undefined,
        tags: Array.isArray(content.tags) ? content.tags.map(String) : ['imported', 'url'],
        is_favorite: Boolean(content.is_favorite || false),
        word_count: String(content.content).split(' ').length,
        usage_count: 0,
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      };

      return caseStudy;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout: URL took too long to respond');
        } else if (error.response?.status === 404) {
          throw new Error('URL not found (404)');
        } else if (error.response && error.response.status >= 400) {
          throw new Error(`Server error: ${error.response.status} ${error.response.statusText || 'Unknown error'}`);
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('Network error: Unable to resolve hostname');
        } else {
          throw new Error(`Network error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to import case study from URL: ${error}`);
      }
    }
  }

  async importBulkCasesFromURL(url: string): Promise<{ cases: CaseStudy[], collectionInfo: any }> {
    try {
      // Validate URL
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are supported');
      }

      // Fetch content with timeout and size limits
      const response = await axios.get(url, {
        timeout: 15000, // 15 second timeout for larger files
        maxContentLength: 50 * 1024 * 1024, // 50MB limit for collections
        maxBodyLength: 50 * 1024 * 1024,
        headers: {
          'User-Agent': 'CritiqueQuest/1.0',
          'Accept': 'application/json',
        },
      });

      return this.processBulkImportContent(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout: Collection file took too long to download');
        } else if (error.response?.status === 404) {
          throw new Error('Collection URL not found (404)');
        } else if (error.response && error.response.status >= 400) {
          throw new Error(`Server error: ${error.response.status} ${error.response.statusText || 'Unknown error'}`);
        } else if (error.code === 'ENOTFOUND') {
          throw new Error('Network error: Unable to resolve hostname');
        } else {
          throw new Error(`Network error: ${error.message}`);
        }
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to import collection from URL: ${error}`);
      }
    }
  }

  async importBulkCasesFromFile(content: string): Promise<{ cases: CaseStudy[], collectionInfo: any }> {
    try {
      const parsedContent = JSON.parse(content);
      return this.processBulkImportContent(parsedContent);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format in collection file');
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Failed to import collection from file: ${error}`);
      }
    }
  }

  private async processBulkImportContent(content: any): Promise<{ cases: CaseStudy[], collectionInfo: any, collections?: Collection[], bundle?: Bundle }> {
    // Check if it's a Bundle format (v2.0)
    if (content.bundle_info && content.bundle_info.version === '2.0') {
      return this.processBundleImport(content);
    }
    
    // Check if it's a legacy collection format (v1.0)
    if (content.cases && Array.isArray(content.cases)) {
      // Legacy collection format
      const collectionInfo = {
        title: content.collection_info?.title || 'Imported Collection',
        description: content.collection_info?.description || `Collection of ${content.cases.length} case studies`,
        total_cases: content.cases.length,
        exported_by: content.exported_by || 'Unknown',
        exported_at: content.exported_at || new Date().toISOString(),
        version: content.version || '1.0',
      };

      const importedCases: CaseStudy[] = [];
      
      for (const caseData of content.cases) {
        if (!caseData.title || !caseData.content) {
          continue; // Skip invalid cases
        }

        const cleanedCase: CaseStudy = {
          title: String(caseData.title),
          domain: String(caseData.domain || 'General'),
          complexity: ['Beginner', 'Intermediate', 'Advanced'].includes(caseData.complexity) 
            ? caseData.complexity 
            : 'Intermediate',
          scenario_type: ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'].includes(caseData.scenario_type)
            ? caseData.scenario_type
            : 'Problem-solving',
          content: String(caseData.content),
          questions: String(caseData.questions || ''),
          answers: caseData.answers ? String(caseData.answers) : undefined,
          tags: Array.isArray(caseData.tags) ? caseData.tags.map(String) : ['imported', 'collection'],
          is_favorite: Boolean(caseData.is_favorite || false),
          word_count: String(caseData.content).split(' ').length,
          usage_count: 0,
          created_date: new Date().toISOString(),
          modified_date: new Date().toISOString(),
          collection_ids: [], // Legacy format doesn't have collection assignments
        };

        importedCases.push(cleanedCase);
      }

      if (importedCases.length === 0) {
        throw new Error('No valid case studies found in collection');
      }

      return { cases: importedCases, collectionInfo };
    } else if (content.title && content.content) {
      // Single case format - convert to collection
      const singleCase = await this.importCaseFromContent(content);
      return {
        cases: [singleCase],
        collectionInfo: {
          title: 'Single Case Import',
          description: 'Single case study imported as collection',
          total_cases: 1,
          exported_by: 'CritiqueQuest',
          exported_at: new Date().toISOString(),
          version: '1.0',
        }
      };
    } else {
      throw new Error('Invalid format: Expected bundle, collection with cases array, or single case study');
    }
  }

  private async processBundleImport(bundle: Bundle): Promise<{ cases: CaseStudy[], collectionInfo: any, collections: Collection[], bundle: Bundle }> {
    const importedCases: CaseStudy[] = [];
    const importedCollections: Collection[] = [];

    // Process collections
    for (const collectionData of bundle.collections) {
      if (!collectionData.name) {
        continue; // Skip invalid collections
      }

      const cleanedCollection: Collection = {
        name: String(collectionData.name),
        description: collectionData.description ? String(collectionData.description) : undefined,
        color: collectionData.color || '#2563EB',
        parent_collection_id: collectionData.parent_collection_id,
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      };

      importedCollections.push(cleanedCollection);
    }

    // Process cases
    for (const caseData of bundle.cases) {
      if (!caseData.title || !caseData.content) {
        continue; // Skip invalid cases
      }

      const cleanedCase: CaseStudy = {
        title: String(caseData.title),
        domain: String(caseData.domain || 'General'),
        complexity: ['Beginner', 'Intermediate', 'Advanced'].includes(caseData.complexity) 
          ? caseData.complexity 
          : 'Intermediate',
        scenario_type: ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'].includes(caseData.scenario_type)
          ? caseData.scenario_type
          : 'Problem-solving',
        content: String(caseData.content),
        questions: String(caseData.questions || ''),
        answers: caseData.answers ? String(caseData.answers) : undefined,
        tags: Array.isArray(caseData.tags) ? caseData.tags.map(String) : ['imported', 'bundle'],
        is_favorite: Boolean(caseData.is_favorite || false),
        word_count: String(caseData.content).split(' ').length,
        usage_count: 0,
        created_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
        collection_ids: Array.isArray(caseData.collection_ids) ? caseData.collection_ids : [],
      };

      importedCases.push(cleanedCase);
    }

    if (importedCases.length === 0) {
      throw new Error('No valid case studies found in bundle');
    }

    const collectionInfo = {
      title: bundle.bundle_info.title,
      description: bundle.bundle_info.description,
      total_cases: importedCases.length,
      total_collections: importedCollections.length,
      exported_by: bundle.bundle_info.exported_by,
      exported_at: bundle.bundle_info.exported_at,
      version: bundle.bundle_info.version,
    };

    return { 
      cases: importedCases, 
      collectionInfo, 
      collections: importedCollections,
      bundle 
    };
  }

  private async importCaseFromContent(content: any): Promise<CaseStudy> {
    // Reuse the validation logic from single case import
    if (!content.title || !content.content) {
      throw new Error('Invalid case study format: missing required fields (title, content)');
    }

    return {
      title: String(content.title),
      domain: String(content.domain || 'General'),
      complexity: ['Beginner', 'Intermediate', 'Advanced'].includes(content.complexity) 
        ? content.complexity 
        : 'Intermediate',
      scenario_type: ['Problem-solving', 'Decision-making', 'Ethical Dilemma', 'Strategic Planning'].includes(content.scenario_type)
        ? content.scenario_type
        : 'Problem-solving',
      content: String(content.content),
      questions: String(content.questions || ''),
      answers: content.answers ? String(content.answers) : undefined,
      tags: Array.isArray(content.tags) ? content.tags.map(String) : ['imported'],
      is_favorite: Boolean(content.is_favorite || false),
      word_count: String(content.content).split(' ').length,
      usage_count: 0,
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      collection_ids: Array.isArray(content.collection_ids) ? content.collection_ids : [],
    };
  }

  private async exportToJSON(caseStudy: CaseStudy, filename: string): Promise<string> {
    // Create a clean export object with all relevant data
    const exportData = {
      ...caseStudy,
      exported_at: new Date().toISOString(),
      exported_by: 'CritiqueQuest',
      version: '1.0'
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const outputPath = join(this.getExportsPath(), `${filename}.json`);
    
    writeFileSync(outputPath, jsonContent, 'utf8');
    return outputPath;
  }

  private async exportToMarkdown(caseStudy: CaseStudy, filename: string): Promise<string> {
    // Create well-structured markdown content
    const markdownContent = `# ${caseStudy.title}

**Domain:** ${caseStudy.domain}  
**Complexity:** ${caseStudy.complexity}  
**Type:** ${caseStudy.scenario_type}  
**Created:** ${caseStudy.created_date ? new Date(caseStudy.created_date).toLocaleDateString() : 'N/A'}

${caseStudy.tags.length > 0 ? `**Tags:** ${caseStudy.tags.map(tag => `\`${tag}\``).join(', ')}\n` : ''}
---

## Case Study Content

${caseStudy.content}

${caseStudy.questions ? `## Analysis Questions

${caseStudy.questions}
` : ''}
${caseStudy.answers ? `## Model Answers

${caseStudy.answers}
` : ''}
---

*Exported from CritiqueQuest on ${new Date().toLocaleDateString()}*
`;

    const outputPath = join(this.getExportsPath(), `${filename}.md`);
    writeFileSync(outputPath, markdownContent, 'utf8');
    return outputPath;
  }

  async exportBulkCases(caseStudies: CaseStudy[], format: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `CritiqueQuest_Collection_${timestamp}`;

    switch (format.toLowerCase()) {
      case 'json':
        return this.exportBulkToJSON(caseStudies, filename);
      case 'zip':
        // For future implementation - export as zip with individual files
        throw new Error('ZIP export not yet implemented');
      default:
        // For other formats, create a combined document
        return this.exportBulkAsCombined(caseStudies, filename, format);
    }
  }

  async exportBundle(collections: Collection[], caseStudies: CaseStudy[], filename: string): Promise<string> {
    // Build collection hierarchies
    const collectionHierarchies = collections.map(collection => ({
      collection_id: collection.id!,
      case_ids: caseStudies
        .filter(c => c.collection_ids && c.collection_ids.includes(collection.id!))
        .map(c => c.id!)
        .filter(id => id !== undefined),
      subcollection_ids: collections
        .filter(c => c.parent_collection_id === collection.id)
        .map(c => c.id!)
        .filter(id => id !== undefined),
    }));

    const bundle: Bundle = {
      bundle_info: {
        title: 'CritiqueQuest Bundle',
        description: `Bundle containing ${collections.length} collections and ${caseStudies.length} case studies`,
        exported_by: 'CritiqueQuest',
        exported_at: new Date().toISOString(),
        version: '2.0',
        total_collections: collections.length,
        total_cases: caseStudies.length,
      },
      collections: collections.map(collection => ({
        ...collection,
        // Remove computed fields for export
        case_count: undefined,
        subcollection_count: undefined,
      })),
      cases: caseStudies.map(caseStudy => ({
        ...caseStudy,
        // Ensure collection_ids are included
        collection_ids: caseStudy.collection_ids || [],
      })),
      collection_hierarchies: collectionHierarchies,
    };

    const jsonContent = JSON.stringify(bundle, null, 2);
    const outputPath = join(this.getExportsPath(), `${filename}.json`);
    
    writeFileSync(outputPath, jsonContent, 'utf8');
    return outputPath;
  }

  private async exportBulkToJSON(caseStudies: CaseStudy[], filename: string): Promise<string> {
    // Create a simple bundle with just cases (backward compatibility)
    const bundle: Bundle = {
      bundle_info: {
        title: 'Case Study Bundle',
        description: `Bundle of ${caseStudies.length} case studies`,
        exported_by: 'CritiqueQuest',
        exported_at: new Date().toISOString(),
        version: '2.0',
        total_collections: 0,
        total_cases: caseStudies.length,
      },
      collections: [],
      cases: caseStudies.map(caseStudy => ({
        ...caseStudy,
        collection_ids: caseStudy.collection_ids || [],
      })),
      collection_hierarchies: [],
    };

    const jsonContent = JSON.stringify(bundle, null, 2);
    const outputPath = join(this.getExportsPath(), `${filename}.json`);
    
    writeFileSync(outputPath, jsonContent, 'utf8');
    return outputPath;
  }

  private async exportBulkAsCombined(caseStudies: CaseStudy[], filename: string, format: string): Promise<string> {
    // Create a combined document with all case studies
    let combinedContent = '';
    
    // Add collection header
    combinedContent += `# Case Study Collection\n\n`;
    combinedContent += `**Exported:** ${new Date().toLocaleString()}\n`;
    combinedContent += `**Total Cases:** ${caseStudies.length}\n`;
    combinedContent += `**Domains:** ${Array.from(new Set(caseStudies.map(c => c.domain))).join(', ')}\n\n`;
    combinedContent += `---\n\n`;

    // Add each case study
    caseStudies.forEach((caseStudy, index) => {
      combinedContent += `# ${index + 1}. ${caseStudy.title}\n\n`;
      combinedContent += `**Domain:** ${caseStudy.domain}  \n`;
      combinedContent += `**Complexity:** ${caseStudy.complexity}  \n`;
      combinedContent += `**Type:** ${caseStudy.scenario_type}  \n`;
      if (caseStudy.tags.length > 0) {
        combinedContent += `**Tags:** ${caseStudy.tags.join(', ')}  \n`;
      }
      combinedContent += `\n---\n\n`;
      
      combinedContent += `## Case Study Content\n\n${caseStudy.content}\n\n`;
      
      if (caseStudy.questions) {
        combinedContent += `## Analysis Questions\n\n${caseStudy.questions}\n\n`;
      }
      
      if (caseStudy.answers) {
        combinedContent += `## Model Answers\n\n${caseStudy.answers}\n\n`;
      }
      
      combinedContent += `---\n\n`;
    });

    combinedContent += `*Generated by CritiqueQuest on ${new Date().toLocaleDateString()}*\n`;

    // Create a single case study object for the existing export methods
    const combinedCase: CaseStudy = {
      title: 'Case Study Collection',
      domain: 'Collection',
      complexity: 'Intermediate' as const,
      scenario_type: 'Problem-solving' as const,
      content: combinedContent,
      questions: '',
      tags: ['collection', 'bulk-export'],
      is_favorite: false,
      word_count: combinedContent.split(' ').length,
      usage_count: 0,
    };

    // Use existing export methods for other formats
    switch (format.toLowerCase()) {
      case 'pdf':
        return this.exportToPDF(combinedCase, filename);
      case 'word':
      case 'docx':
        return this.exportToWord(combinedCase, filename);
      case 'html':
        return this.exportToHTML(combinedCase, filename);
      case 'text':
      case 'txt':
        return this.exportToText(combinedCase, filename);
      case 'markdown':
      case 'md':
        return this.exportToMarkdown(combinedCase, filename);
      default:
        throw new Error(`Unsupported bulk export format: ${format}`);
    }
  }

  async showSaveDialog(defaultFilename: string, filters: any[]): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      defaultPath: defaultFilename,
      filters,
    });

    return result.canceled ? null : result.filePath || null;
  }

  async showOpenDialog(filters: any[]): Promise<string[] | null> {
    const result = await dialog.showOpenDialog({
      filters,
      properties: ['openFile'],
    });

    return result.canceled ? null : result.filePaths;
  }
}