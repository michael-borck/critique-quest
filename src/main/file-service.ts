import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { app, dialog } from 'electron';
import jsPDF from 'jspdf';
import type { CaseStudy } from '../shared/types';

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