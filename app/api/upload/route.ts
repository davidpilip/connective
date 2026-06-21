import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { analyzeImageVibe } from '@/lib/embeddings';

const SUPPORTED_TEXT_FORMATS = ['txt', 'pdf'];
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

// Extract images from PDF pages by rendering pages as images
async function extractImagesFromPDF(buffer: Buffer): Promise<string[]> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const { createCanvas } = await import('canvas');
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDocument = await loadingTask.promise;
    const imageBase64s: string[] = [];
    
    // Process first 5 pages (to avoid too many API calls)
    const maxPages = Math.min(5, pdfDocument.numPages);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Render page as image using canvas
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({
        canvasContext: context as any,
        viewport: viewport,
      }).promise;
      
      // Convert canvas to base64 JPEG
      const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
      const base64 = imageBuffer.toString('base64');
      
      if (base64) {
        imageBase64s.push(base64);
      }
    }
    
    return imageBase64s;
  } catch (error) {
    console.error('Error extracting images from PDF:', error);
    // If PDF image extraction fails, just return empty array - text extraction will still work
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }
    
    let combinedText = '';
    const imageDescriptions: string[] = [];
    let pdfImageCount = 0;
    
    // Process each file
    for (const file of files) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileType) continue;
      
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Handle text/PDF files
      if (SUPPORTED_TEXT_FORMATS.includes(fileType)) {
        let fileText = '';
        
        if (fileType === 'txt') {
          fileText = buffer.toString('utf-8');
        } else if (fileType === 'pdf') {
          // Extract text from PDF
          const data = await pdf(buffer);
          fileText = data.text;
          
          // Extract images from PDF pages
          const pdfImages = await extractImagesFromPDF(buffer);
          pdfImageCount = pdfImages.length;
          
          // Analyze each PDF page image
          for (const imageBase64 of pdfImages) {
            try {
              const vibeDescription = await analyzeImageVibe(imageBase64);
              if (vibeDescription) {
                imageDescriptions.push(`PDF page image: ${vibeDescription}`);
              }
            } catch (err) {
              console.error('Error analyzing PDF image:', err);
            }
          }
        }
        
        if (fileText) {
          combinedText += fileText + '\n\n';
        }
      }
      
      // Handle image files - analyze with GPT-4 Vision
      else if (SUPPORTED_IMAGE_FORMATS.includes(fileType)) {
        const base64Image = buffer.toString('base64');
        const vibeDescription = await analyzeImageVibe(base64Image);
        
        if (vibeDescription) {
          imageDescriptions.push(vibeDescription);
        }
      }
    }
    
    // Combine image vibe descriptions with text
    if (imageDescriptions.length > 0) {
      const imageVibeText = `Visual references (${imageDescriptions.length} image${imageDescriptions.length !== 1 ? 's' : ''}${pdfImageCount > 0 ? `, ${pdfImageCount} from PDF` : ''}):\n${imageDescriptions.join('\n\n')}`;
      combinedText = imageVibeText + '\n\n' + combinedText;
    }
    
    return NextResponse.json({ 
      fileText: combinedText.trim(),
      processedImages: imageDescriptions.length,
      processedTextFiles: files.length - imageDescriptions.length + pdfImageCount
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    );
  }
}


