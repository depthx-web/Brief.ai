-- Seeds Page + ContentSection rows for every individual tool page
-- (SEO tool page template) so admin edits at /admin/content -> "Tool page —
-- <name>" start from the same content already live via TOOL_SEO_CONTENT
-- (apps/web/src/lib/toolSeoContent.ts), not empty sections.

-- pdf-to-images
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-images');
SET @page_pdf_to_images = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-images');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_images, 'features', 0, '{"items":["Exports every page as a separate JPG or PNG","Keeps full page resolution for printing or sharing","Runs entirely in your browser — no upload needed"]}', '{"items":["Exports every page as a separate JPG or PNG","Keeps full page resolution for printing or sharing","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_images, 'faq', 1, '{"items":[{"q":"What image formats can I export to?","a":"JPG and PNG, one image per page."},{"q":"Is there a page limit?","a":"No — every page in the PDF is exported."},{"q":"Does this upload my file anywhere?","a":"No, the conversion runs locally in your browser."}]}', '{"items":[{"q":"What image formats can I export to?","a":"JPG and PNG, one image per page."},{"q":"Is there a page limit?","a":"No — every page in the PDF is exported."},{"q":"Does this upload my file anywhere?","a":"No, the conversion runs locally in your browser."}]}', NOW(3));

-- images-to-pdf
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-images-to-pdf');
SET @page_images_to_pdf = (SELECT id FROM `Page` WHERE slug = 'tools-images-to-pdf');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_images_to_pdf, 'features', 0, '{"items":["Combines any number of JPG or PNG images into one PDF","Preserves each image at its original quality","Runs entirely in your browser — no upload needed"]}', '{"items":["Combines any number of JPG or PNG images into one PDF","Preserves each image at its original quality","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_images_to_pdf, 'faq', 1, '{"items":[{"q":"Can I reorder the images before combining?","a":"Yes — drag images into the order you want before converting."},{"q":"Does it work with mixed JPG and PNG files?","a":"Yes, you can combine both formats in one PDF."},{"q":"Is my image data uploaded anywhere?","a":"No, everything is processed locally in your browser."}]}', '{"items":[{"q":"Can I reorder the images before combining?","a":"Yes — drag images into the order you want before converting."},{"q":"Does it work with mixed JPG and PNG files?","a":"Yes, you can combine both formats in one PDF."},{"q":"Is my image data uploaded anywhere?","a":"No, everything is processed locally in your browser."}]}', NOW(3));

-- word-to-pdf
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-word-to-pdf');
SET @page_word_to_pdf = (SELECT id FROM `Page` WHERE slug = 'tools-word-to-pdf');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_word_to_pdf, 'features', 0, '{"items":["Converts .docx Word documents to PDF","Preserves formatting, fonts, and page layout","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts .docx Word documents to PDF","Preserves formatting, fonts, and page layout","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_word_to_pdf, 'faq', 1, '{"items":[{"q":"Will my formatting stay intact?","a":"Yes — fonts, spacing, and layout are preserved in the output PDF."},{"q":"What happens to my file after conversion?","a":"It is automatically and permanently deleted per your retention setting."},{"q":"Does this need a paid plan?","a":"Office-to-PDF conversion is a server-side operation and may require a plan — see Pricing."}]}', '{"items":[{"q":"Will my formatting stay intact?","a":"Yes — fonts, spacing, and layout are preserved in the output PDF."},{"q":"What happens to my file after conversion?","a":"It is automatically and permanently deleted per your retention setting."},{"q":"Does this need a paid plan?","a":"Office-to-PDF conversion is a server-side operation and may require a plan — see Pricing."}]}', NOW(3));

-- pdf-to-word
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-word');
SET @page_pdf_to_word = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-word');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_word, 'features', 0, '{"items":["Converts a PDF into an editable .docx Word document","Recovers paragraphs and basic formatting, not just raw text","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts a PDF into an editable .docx Word document","Recovers paragraphs and basic formatting, not just raw text","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_word, 'faq', 1, '{"items":[{"q":"Will the output be fully editable?","a":"Yes — text, paragraphs, and basic formatting convert into an editable Word document."},{"q":"Does this work on scanned PDFs?","a":"Best results are on text-based PDFs; for scans, run OCR first."},{"q":"Is my file stored after conversion?","a":"No, it is auto-deleted per your retention setting."}]}', '{"items":[{"q":"Will the output be fully editable?","a":"Yes — text, paragraphs, and basic formatting convert into an editable Word document."},{"q":"Does this work on scanned PDFs?","a":"Best results are on text-based PDFs; for scans, run OCR first."},{"q":"Is my file stored after conversion?","a":"No, it is auto-deleted per your retention setting."}]}', NOW(3));

-- excel-to-pdf
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-excel-to-pdf');
SET @page_excel_to_pdf = (SELECT id FROM `Page` WHERE slug = 'tools-excel-to-pdf');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_excel_to_pdf, 'features', 0, '{"items":["Converts .xlsx spreadsheets to PDF","Preserves columns, rows, and cell formatting","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts .xlsx spreadsheets to PDF","Preserves columns, rows, and cell formatting","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_excel_to_pdf, 'faq', 1, '{"items":[{"q":"Do multiple sheets convert too?","a":"Yes, every sheet in the workbook is included."},{"q":"Will large spreadsheets fit on the page?","a":"Wide sheets scale to fit the printable page width."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', '{"items":[{"q":"Do multiple sheets convert too?","a":"Yes, every sheet in the workbook is included."},{"q":"Will large spreadsheets fit on the page?","a":"Wide sheets scale to fit the printable page width."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', NOW(3));

-- pdf-to-excel
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-excel');
SET @page_pdf_to_excel = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-excel');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_excel, 'features', 0, '{"items":["Converts a PDF into an editable .xlsx spreadsheet","Attempts to recover tabular data into real cells","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts a PDF into an editable .xlsx spreadsheet","Attempts to recover tabular data into real cells","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_excel, 'faq', 1, '{"items":[{"q":"Does this work well on any PDF?","a":"Best results are on PDFs with clear table structure."},{"q":"Will formulas be recreated?","a":"No — values convert as static data, not live formulas."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', '{"items":[{"q":"Does this work well on any PDF?","a":"Best results are on PDFs with clear table structure."},{"q":"Will formulas be recreated?","a":"No — values convert as static data, not live formulas."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', NOW(3));

-- powerpoint-to-pdf
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-powerpoint-to-pdf');
SET @page_powerpoint_to_pdf = (SELECT id FROM `Page` WHERE slug = 'tools-powerpoint-to-pdf');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_powerpoint_to_pdf, 'features', 0, '{"items":["Converts .pptx presentations to PDF","Preserves slide layout, images, and text","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts .pptx presentations to PDF","Preserves slide layout, images, and text","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_powerpoint_to_pdf, 'faq', 1, '{"items":[{"q":"Are speaker notes included?","a":"No, only the visible slide content converts."},{"q":"Will animations or transitions carry over?","a":"No — PDF is a static format, so each slide becomes one page."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', '{"items":[{"q":"Are speaker notes included?","a":"No, only the visible slide content converts."},{"q":"Will animations or transitions carry over?","a":"No — PDF is a static format, so each slide becomes one page."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', NOW(3));

-- pdf-to-powerpoint
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-powerpoint');
SET @page_pdf_to_powerpoint = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-powerpoint');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_powerpoint, 'features', 0, '{"items":["Converts a PDF into an editable .pptx presentation","One slide is created per PDF page","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts a PDF into an editable .pptx presentation","One slide is created per PDF page","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_powerpoint, 'faq', 1, '{"items":[{"q":"Will text be editable in the output?","a":"Yes, text boxes are recreated as editable PowerPoint elements."},{"q":"Does formatting match the original PDF exactly?","a":"Layout is approximated — complex designs may need minor adjustment."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', '{"items":[{"q":"Will text be editable in the output?","a":"Yes, text boxes are recreated as editable PowerPoint elements."},{"q":"Does formatting match the original PDF exactly?","a":"Layout is approximated — complex designs may need minor adjustment."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', NOW(3));

-- pdf-to-text
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-text');
SET @page_pdf_to_text = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-text');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_text, 'features', 0, '{"items":["Extracts every page’s text into a single .txt file","Keeps reading order intact","Runs entirely in your browser — no upload needed"]}', '{"items":["Extracts every page’s text into a single .txt file","Keeps reading order intact","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_text, 'faq', 1, '{"items":[{"q":"Does this work on scanned PDFs?","a":"Only on text-based PDFs; scans need OCR first for extractable text."},{"q":"Is formatting like bold or tables preserved?","a":"No — output is plain text with no formatting."},{"q":"Is my file uploaded anywhere?","a":"No, extraction runs locally in your browser."}]}', '{"items":[{"q":"Does this work on scanned PDFs?","a":"Only on text-based PDFs; scans need OCR first for extractable text."},{"q":"Is formatting like bold or tables preserved?","a":"No — output is plain text with no formatting."},{"q":"Is my file uploaded anywhere?","a":"No, extraction runs locally in your browser."}]}', NOW(3));

-- pdf-to-html
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-pdf-to-html');
SET @page_pdf_to_html = (SELECT id FROM `Page` WHERE slug = 'tools-pdf-to-html');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_html, 'features', 0, '{"items":["Converts a PDF into a single styled HTML page","Keeps text selectable and readable in a browser","Processed on our servers and auto-deleted after use"]}', '{"items":["Converts a PDF into a single styled HTML page","Keeps text selectable and readable in a browser","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_pdf_to_html, 'faq', 1, '{"items":[{"q":"Will images be included?","a":"Yes, embedded images convert along with the text."},{"q":"Can I edit the HTML afterward?","a":"Yes, the output is plain HTML you can edit in any editor."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', '{"items":[{"q":"Will images be included?","a":"Yes, embedded images convert along with the text."},{"q":"Can I edit the HTML afterward?","a":"Yes, the output is plain HTML you can edit in any editor."},{"q":"Is billing required?","a":"This is a server-side operation and may require a plan — see Pricing."}]}', NOW(3));

-- merge
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-merge');
SET @page_merge = (SELECT id FROM `Page` WHERE slug = 'tools-merge');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_merge, 'features', 0, '{"items":["Combines multiple PDFs into a single file","Drag to reorder files before merging","Runs entirely in your browser — no upload needed"]}', '{"items":["Combines multiple PDFs into a single file","Drag to reorder files before merging","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_merge, 'faq', 1, '{"items":[{"q":"Is there a limit on how many files I can merge?","a":"No practical limit — merge as many PDFs as you need."},{"q":"Can I change the order of the files?","a":"Yes, drag files into the order you want before merging."},{"q":"Does this upload my files anywhere?","a":"No, merging happens locally in your browser."}]}', '{"items":[{"q":"Is there a limit on how many files I can merge?","a":"No practical limit — merge as many PDFs as you need."},{"q":"Can I change the order of the files?","a":"Yes, drag files into the order you want before merging."},{"q":"Does this upload my files anywhere?","a":"No, merging happens locally in your browser."}]}', NOW(3));

-- split
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-split');
SET @page_split = (SELECT id FROM `Page` WHERE slug = 'tools-split');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_split, 'features', 0, '{"items":["Extracts a page range or every page individually","Preview pages before choosing what to extract","Runs entirely in your browser — no upload needed"]}', '{"items":["Extracts a page range or every page individually","Preview pages before choosing what to extract","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_split, 'faq', 1, '{"items":[{"q":"Can I extract non-consecutive pages?","a":"Yes, specify any combination of pages or ranges."},{"q":"What do I get back — one file or several?","a":"You choose: one combined file, or a separate file per page."},{"q":"Is my file uploaded anywhere?","a":"No, splitting runs locally in your browser."}]}', '{"items":[{"q":"Can I extract non-consecutive pages?","a":"Yes, specify any combination of pages or ranges."},{"q":"What do I get back — one file or several?","a":"You choose: one combined file, or a separate file per page."},{"q":"Is my file uploaded anywhere?","a":"No, splitting runs locally in your browser."}]}', NOW(3));

-- organize
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-organize');
SET @page_organize = (SELECT id FROM `Page` WHERE slug = 'tools-organize');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_organize, 'features', 0, '{"items":["Drag to reorder pages within a PDF","Delete unwanted pages in the same view","Runs entirely in your browser — no upload needed"]}', '{"items":["Drag to reorder pages within a PDF","Delete unwanted pages in the same view","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_organize, 'faq', 1, '{"items":[{"q":"Can I both reorder and delete pages at once?","a":"Yes, both actions happen in the same workspace."},{"q":"Will page numbers update automatically?","a":"The PDF reflects your new order; existing page-number stamps are not recalculated."},{"q":"Is my file uploaded anywhere?","a":"No, organizing runs locally in your browser."}]}', '{"items":[{"q":"Can I both reorder and delete pages at once?","a":"Yes, both actions happen in the same workspace."},{"q":"Will page numbers update automatically?","a":"The PDF reflects your new order; existing page-number stamps are not recalculated."},{"q":"Is my file uploaded anywhere?","a":"No, organizing runs locally in your browser."}]}', NOW(3));

-- rotate
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-rotate');
SET @page_rotate = (SELECT id FROM `Page` WHERE slug = 'tools-rotate');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_rotate, 'features', 0, '{"items":["Rotates every page in a PDF, or just the ones you pick","Preview each page’s orientation before saving","Runs entirely in your browser — no upload needed"]}', '{"items":["Rotates every page in a PDF, or just the ones you pick","Preview each page’s orientation before saving","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_rotate, 'faq', 1, '{"items":[{"q":"Can I rotate just one page instead of all of them?","a":"Yes, rotation can be applied per page."},{"q":"What rotation angles are supported?","a":"90, 180, and 270 degrees."},{"q":"Is my file uploaded anywhere?","a":"No, rotation runs locally in your browser."}]}', '{"items":[{"q":"Can I rotate just one page instead of all of them?","a":"Yes, rotation can be applied per page."},{"q":"What rotation angles are supported?","a":"90, 180, and 270 degrees."},{"q":"Is my file uploaded anywhere?","a":"No, rotation runs locally in your browser."}]}', NOW(3));

-- page-numbers
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-page-numbers');
SET @page_page_numbers = (SELECT id FROM `Page` WHERE slug = 'tools-page-numbers');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_page_numbers, 'features', 0, '{"items":["Stamps page numbers onto every page","Choose position, starting number, and format","Runs entirely in your browser — no upload needed"]}', '{"items":["Stamps page numbers onto every page","Choose position, starting number, and format","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_page_numbers, 'faq', 1, '{"items":[{"q":"Can I start numbering from a page other than 1?","a":"Yes, set any starting number."},{"q":"Where can the numbers be placed?","a":"Any corner or center position, top or bottom."},{"q":"Is my file uploaded anywhere?","a":"No, this runs locally in your browser."}]}', '{"items":[{"q":"Can I start numbering from a page other than 1?","a":"Yes, set any starting number."},{"q":"Where can the numbers be placed?","a":"Any corner or center position, top or bottom."},{"q":"Is my file uploaded anywhere?","a":"No, this runs locally in your browser."}]}', NOW(3));

-- compress
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-compress');
SET @page_compress = (SELECT id FROM `Page` WHERE slug = 'tools-compress');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_compress, 'features', 0, '{"items":["Shrinks file size for scanned or image-heavy PDFs","Keeps the document readable at a smaller size","Runs entirely in your browser — no upload needed"]}', '{"items":["Shrinks file size for scanned or image-heavy PDFs","Keeps the document readable at a smaller size","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_compress, 'faq', 1, '{"items":[{"q":"How much smaller will my file get?","a":"It depends on content — image-heavy scans compress the most."},{"q":"Will text quality suffer?","a":"Text-based PDFs are largely unaffected; this mainly targets embedded images."},{"q":"Is my file uploaded anywhere?","a":"No, compression runs locally in your browser."}]}', '{"items":[{"q":"How much smaller will my file get?","a":"It depends on content — image-heavy scans compress the most."},{"q":"Will text quality suffer?","a":"Text-based PDFs are largely unaffected; this mainly targets embedded images."},{"q":"Is my file uploaded anywhere?","a":"No, compression runs locally in your browser."}]}', NOW(3));

-- compress-high-ratio
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-compress-high-ratio');
SET @page_compress_high_ratio = (SELECT id FROM `Page` WHERE slug = 'tools-compress-high-ratio');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_compress_high_ratio, 'features', 0, '{"items":["Server-side high-ratio compression for the toughest files","Keeps text sharp and selectable, unlike basic compression","Processed on our servers and auto-deleted after use"]}', '{"items":["Server-side high-ratio compression for the toughest files","Keeps text sharp and selectable, unlike basic compression","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_compress_high_ratio, 'faq', 1, '{"items":[{"q":"How is this different from the free Compress tool?","a":"It uses a stronger server-side engine for deeper size reduction while keeping text selectable."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', '{"items":[{"q":"How is this different from the free Compress tool?","a":"It uses a stronger server-side engine for deeper size reduction while keeping text selectable."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."},{"q":"Is my file kept afterward?","a":"No, it is auto-deleted per your retention setting."}]}', NOW(3));

-- ocr
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-ocr');
SET @page_ocr = (SELECT id FROM `Page` WHERE slug = 'tools-ocr');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_ocr, 'features', 0, '{"items":["Makes a scanned PDF searchable and selectable","Recognizes text across the whole document","Runs entirely in your browser — no upload needed"]}', '{"items":["Makes a scanned PDF searchable and selectable","Recognizes text across the whole document","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_ocr, 'faq', 1, '{"items":[{"q":"Will this work on a photo of a document?","a":"Yes, as long as the text is reasonably legible."},{"q":"What languages are supported?","a":"OCR works best on English text; other languages may have lower accuracy."},{"q":"Is my file uploaded anywhere?","a":"No, OCR runs locally in your browser."}]}', '{"items":[{"q":"Will this work on a photo of a document?","a":"Yes, as long as the text is reasonably legible."},{"q":"What languages are supported?","a":"OCR works best on English text; other languages may have lower accuracy."},{"q":"Is my file uploaded anywhere?","a":"No, OCR runs locally in your browser."}]}', NOW(3));

-- sign
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-sign');
SET @page_sign = (SELECT id FROM `Page` WHERE slug = 'tools-sign');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_sign, 'features', 0, '{"items":["Draw or upload a signature and place it on a page","Save a signature for reuse next time","Runs entirely in your browser — no upload needed"]}', '{"items":["Draw or upload a signature and place it on a page","Save a signature for reuse next time","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_sign, 'faq', 1, '{"items":[{"q":"Is this a legally binding e-signature?","a":"This adds a visual signature to the document; it is not a certified e-signature service."},{"q":"Can I resize or reposition my signature?","a":"Yes, drag and resize it before saving."},{"q":"Is my file uploaded anywhere?","a":"No, signing runs locally in your browser."}]}', '{"items":[{"q":"Is this a legally binding e-signature?","a":"This adds a visual signature to the document; it is not a certified e-signature service."},{"q":"Can I resize or reposition my signature?","a":"Yes, drag and resize it before saving."},{"q":"Is my file uploaded anywhere?","a":"No, signing runs locally in your browser."}]}', NOW(3));

-- protect
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-protect');
SET @page_protect = (SELECT id FROM `Page` WHERE slug = 'tools-protect');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_protect, 'features', 0, '{"items":["Adds a password so only people who know it can open the file","Choose separate owner and user passwords","Processed on our servers and auto-deleted after use"]}', '{"items":["Adds a password so only people who know it can open the file","Choose separate owner and user passwords","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_protect, 'faq', 1, '{"items":[{"q":"What encryption is used?","a":"256-bit AES encryption via the industry-standard qpdf engine."},{"q":"Can I set a different password for editing vs. opening?","a":"Yes, owner and user passwords can be set independently."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."}]}', '{"items":[{"q":"What encryption is used?","a":"256-bit AES encryption via the industry-standard qpdf engine."},{"q":"Can I set a different password for editing vs. opening?","a":"Yes, owner and user passwords can be set independently."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."}]}', NOW(3));

-- remove-password
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-remove-password');
SET @page_remove_password = (SELECT id FROM `Page` WHERE slug = 'tools-remove-password');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_remove_password, 'features', 0, '{"items":["Removes password protection given the current password","Restores full, unrestricted access to the file","Processed on our servers and auto-deleted after use"]}', '{"items":["Removes password protection given the current password","Restores full, unrestricted access to the file","Processed on our servers and auto-deleted after use"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_remove_password, 'faq', 1, '{"items":[{"q":"Do I need to know the current password?","a":"Yes, this only removes protection from a file you can already open."},{"q":"Can this crack a password I’ve forgotten?","a":"No, it only removes protection when the current password is provided."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."}]}', '{"items":[{"q":"Do I need to know the current password?","a":"Yes, this only removes protection from a file you can already open."},{"q":"Can this crack a password I’ve forgotten?","a":"No, it only removes protection when the current password is provided."},{"q":"Does this need a paid plan?","a":"Yes, this is a server-side operation — see Pricing."}]}', NOW(3));

-- watermark
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-watermark');
SET @page_watermark = (SELECT id FROM `Page` WHERE slug = 'tools-watermark');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_watermark, 'features', 0, '{"items":["Stamps text across every page","Control opacity, angle, and position","Runs entirely in your browser — no upload needed"]}', '{"items":["Stamps text across every page","Control opacity, angle, and position","Runs entirely in your browser — no upload needed"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_watermark, 'faq', 1, '{"items":[{"q":"Can I use my own text?","a":"Yes, type any text — a name, \\"Confidential\\", a date, etc."},{"q":"Will the watermark cover important content?","a":"You control opacity and placement so it stays legible underneath."},{"q":"Is my file uploaded anywhere?","a":"No, watermarking runs locally in your browser."}]}', '{"items":[{"q":"Can I use my own text?","a":"Yes, type any text — a name, \\"Confidential\\", a date, etc."},{"q":"Will the watermark cover important content?","a":"You control opacity and placement so it stays legible underneath."},{"q":"Is my file uploaded anywhere?","a":"No, watermarking runs locally in your browser."}]}', NOW(3));

-- batch-invoices
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-batch-invoices');
SET @page_batch_invoices = (SELECT id FROM `Page` WHERE slug = 'tools-batch-invoices');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_batch_invoices, 'features', 0, '{"items":["Extracts data from many invoices at once","Exports results to CSV for your accounting software","AI-powered — requires an account and a plan"]}', '{"items":["Extracts data from many invoices at once","Exports results to CSV for your accounting software","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_batch_invoices, 'faq', 1, '{"items":[{"q":"How many invoices can I process at once?","a":"Upload as many as you need in one batch."},{"q":"What fields are extracted?","a":"Vendor, amount, date, and invoice number, among other common fields."},{"q":"Is this tool free?","a":"AI extraction requires an account with an active plan or credits."}]}', '{"items":[{"q":"How many invoices can I process at once?","a":"Upload as many as you need in one batch."},{"q":"What fields are extracted?","a":"Vendor, amount, date, and invoice number, among other common fields."},{"q":"Is this tool free?","a":"AI extraction requires an account with an active plan or credits."}]}', NOW(3));

-- contract-compare
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-contract-compare');
SET @page_contract_compare = (SELECT id FROM `Page` WHERE slug = 'tools-contract-compare');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_contract_compare, 'features', 0, '{"items":["Compares two versions of a contract side by side","AI flags what changed and its risk level","AI-powered — requires an account and a plan"]}', '{"items":["Compares two versions of a contract side by side","AI flags what changed and its risk level","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_contract_compare, 'faq', 1, '{"items":[{"q":"How does this differ from a plain text diff?","a":"AI explains what each change means and flags risk, not just what text moved."},{"q":"Do both versions need to be PDFs?","a":"Yes, upload both contract versions as PDF."},{"q":"Is this tool free?","a":"AI comparison requires an account with an active plan or credits."}]}', '{"items":[{"q":"How does this differ from a plain text diff?","a":"AI explains what each change means and flags risk, not just what text moved."},{"q":"Do both versions need to be PDFs?","a":"Yes, upload both contract versions as PDF."},{"q":"Is this tool free?","a":"AI comparison requires an account with an active plan or credits."}]}', NOW(3));

-- high-risk-clauses
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-high-risk-clauses');
SET @page_high_risk_clauses = (SELECT id FROM `Page` WHERE slug = 'tools-high-risk-clauses');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_high_risk_clauses, 'features', 0, '{"items":["Flags unfair, incomplete, or non-standard clauses","Explains why each flagged clause is risky","AI-powered — requires an account and a plan"]}', '{"items":["Flags unfair, incomplete, or non-standard clauses","Explains why each flagged clause is risky","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_high_risk_clauses, 'faq', 1, '{"items":[{"q":"Does this replace a lawyer’s review?","a":"No, it flags clauses worth a closer look, not a substitute for legal advice."},{"q":"What kinds of contracts work best?","a":"Any standard business contract — NDAs, service agreements, leases, and similar."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', '{"items":[{"q":"Does this replace a lawyer’s review?","a":"No, it flags clauses worth a closer look, not a substitute for legal advice."},{"q":"What kinds of contracts work best?","a":"Any standard business contract — NDAs, service agreements, leases, and similar."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', NOW(3));

-- plain-summary
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-plain-summary');
SET @page_plain_summary = (SELECT id FROM `Page` WHERE slug = 'tools-plain-summary');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_plain_summary, 'features', 0, '{"items":["Turns a contract into a summary a non-legal reader can understand","Highlights key obligations and dates in plain language","AI-powered — requires an account and a plan"]}', '{"items":["Turns a contract into a summary a non-legal reader can understand","Highlights key obligations and dates in plain language","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_plain_summary, 'faq', 1, '{"items":[{"q":"Who is this summary written for?","a":"A client or colleague without a legal background."},{"q":"Does it cover every clause?","a":"It focuses on the most important terms, not a clause-by-clause breakdown."},{"q":"Is this tool free?","a":"AI summarization requires an account with an active plan or credits."}]}', '{"items":[{"q":"Who is this summary written for?","a":"A client or colleague without a legal background."},{"q":"Does it cover every clause?","a":"It focuses on the most important terms, not a clause-by-clause breakdown."},{"q":"Is this tool free?","a":"AI summarization requires an account with an active plan or credits."}]}', NOW(3));

-- nda-audit
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-nda-audit');
SET @page_nda_audit = (SELECT id FROM `Page` WHERE slug = 'tools-nda-audit');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_nda_audit, 'features', 0, '{"items":["Checks an NDA against confidentiality duration, exceptions, and scope","Flags terms that are unusually broad or missing","AI-powered — requires an account and a plan"]}', '{"items":["Checks an NDA against confidentiality duration, exceptions, and scope","Flags terms that are unusually broad or missing","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_nda_audit, 'faq', 1, '{"items":[{"q":"What does the audit actually check?","a":"Duration, exceptions, scope of confidential information, and other standard NDA terms."},{"q":"Does this work for mutual and one-way NDAs?","a":"Yes, both are supported."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', '{"items":[{"q":"What does the audit actually check?","a":"Duration, exceptions, scope of confidential information, and other standard NDA terms."},{"q":"Does this work for mutual and one-way NDAs?","a":"Yes, both are supported."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', NOW(3));

-- redaction-detector
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-redaction-detector');
SET @page_redaction_detector = (SELECT id FROM `Page` WHERE slug = 'tools-redaction-detector');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_redaction_detector, 'features', 0, '{"items":["Detects ID numbers and bank account numbers worth redacting","Flags sensitive data before you share a document","AI-powered — requires an account and a plan"]}', '{"items":["Detects ID numbers and bank account numbers worth redacting","Flags sensitive data before you share a document","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_redaction_detector, 'faq', 1, '{"items":[{"q":"Does this redact the document automatically?","a":"It flags what to redact — you review and apply redactions yourself."},{"q":"What kinds of sensitive data are detected?","a":"ID numbers, bank account numbers, and similar identifiers."},{"q":"Is this tool free?","a":"AI detection requires an account with an active plan or credits."}]}', '{"items":[{"q":"Does this redact the document automatically?","a":"It flags what to redact — you review and apply redactions yourself."},{"q":"What kinds of sensitive data are detected?","a":"ID numbers, bank account numbers, and similar identifiers."},{"q":"Is this tool free?","a":"AI detection requires an account with an active plan or credits."}]}', NOW(3));

-- duplicate-payments
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-duplicate-payments');
SET @page_duplicate_payments = (SELECT id FROM `Page` WHERE slug = 'tools-duplicate-payments');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_duplicate_payments, 'features', 0, '{"items":["Flags the same vendor, amount, and date appearing more than once","Catches accidental double-payments before they go out","AI-powered — requires an account and a plan"]}', '{"items":["Flags the same vendor, amount, and date appearing more than once","Catches accidental double-payments before they go out","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_duplicate_payments, 'faq', 1, '{"items":[{"q":"What counts as a duplicate?","a":"Matching vendor, amount, and date within the documents you upload."},{"q":"Can I upload multiple invoices at once?","a":"Yes, upload a batch and duplicates are flagged across all of them."},{"q":"Is this tool free?","a":"AI detection requires an account with an active plan or credits."}]}', '{"items":[{"q":"What counts as a duplicate?","a":"Matching vendor, amount, and date within the documents you upload."},{"q":"Can I upload multiple invoices at once?","a":"Yes, upload a batch and duplicates are flagged across all of them."},{"q":"Is this tool free?","a":"AI detection requires an account with an active plan or credits."}]}', NOW(3));

-- financial-ratios
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-financial-ratios');
SET @page_financial_ratios = (SELECT id FROM `Page` WHERE slug = 'tools-financial-ratios');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_financial_ratios, 'features', 0, '{"items":["Extracts liquidity and profitability ratios from financial statements","Explains each ratio in plain language","AI-powered — requires an account and a plan"]}', '{"items":["Extracts liquidity and profitability ratios from financial statements","Explains each ratio in plain language","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_financial_ratios, 'faq', 1, '{"items":[{"q":"What ratios are calculated?","a":"Common liquidity and profitability ratios such as current ratio and profit margin."},{"q":"What kind of document do I need?","a":"A financial statement in PDF form — balance sheet or income statement."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', '{"items":[{"q":"What ratios are calculated?","a":"Common liquidity and profitability ratios such as current ratio and profit margin."},{"q":"What kind of document do I need?","a":"A financial statement in PDF form — balance sheet or income statement."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', NOW(3));

-- bank-reconciliation
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-bank-reconciliation');
SET @page_bank_reconciliation = (SELECT id FROM `Page` WHERE slug = 'tools-bank-reconciliation');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_bank_reconciliation, 'features', 0, '{"items":["Compares a bank statement against recorded invoices","Flags discrepancies automatically","AI-powered — requires an account and a plan"]}', '{"items":["Compares a bank statement against recorded invoices","Flags discrepancies automatically","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_bank_reconciliation, 'faq', 1, '{"items":[{"q":"What documents do I need?","a":"A bank statement and the invoices or records you want to reconcile against it."},{"q":"What counts as a discrepancy?","a":"Amounts or transactions in one document with no clear match in the other."},{"q":"Is this tool free?","a":"AI reconciliation requires an account with an active plan or credits."}]}', '{"items":[{"q":"What documents do I need?","a":"A bank statement and the invoices or records you want to reconcile against it."},{"q":"What counts as a discrepancy?","a":"Amounts or transactions in one document with no clear match in the other."},{"q":"Is this tool free?","a":"AI reconciliation requires an account with an active plan or credits."}]}', NOW(3));

-- tax-deductible
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-tax-deductible');
SET @page_tax_deductible = (SELECT id FROM `Page` WHERE slug = 'tools-tax-deductible');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_tax_deductible, 'features', 0, '{"items":["Highlights likely tax-deductible line items by category","Works from receipts, invoices, or statements","AI-powered — requires an account and a plan"]}', '{"items":["Highlights likely tax-deductible line items by category","Works from receipts, invoices, or statements","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_tax_deductible, 'faq', 1, '{"items":[{"q":"Is this a substitute for a tax professional?","a":"No, it flags likely deductible items for you to confirm, not tax advice."},{"q":"What categories does it recognize?","a":"Common business expense categories such as travel, supplies, and software."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', '{"items":[{"q":"Is this a substitute for a tax professional?","a":"No, it flags likely deductible items for you to confirm, not tax advice."},{"q":"What categories does it recognize?","a":"Common business expense categories such as travel, supplies, and software."},{"q":"Is this tool free?","a":"AI analysis requires an account with an active plan or credits."}]}', NOW(3));

-- multi-paper-compare
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-multi-paper-compare');
SET @page_multi_paper_compare = (SELECT id FROM `Page` WHERE slug = 'tools-multi-paper-compare');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_multi_paper_compare, 'features', 0, '{"items":["Compares methodology and results across two papers","AI explains what differs and why it matters","AI-powered — requires an account and a plan"]}', '{"items":["Compares methodology and results across two papers","AI explains what differs and why it matters","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_multi_paper_compare, 'faq', 1, '{"items":[{"q":"Do both papers need to be on the same topic?","a":"It works best when the papers address related research questions."},{"q":"Does it compare more than two papers at once?","a":"Currently, it compares two papers per run."},{"q":"Is this tool free?","a":"AI comparison requires an account with an active plan or credits."}]}', '{"items":[{"q":"Do both papers need to be on the same topic?","a":"It works best when the papers address related research questions."},{"q":"Does it compare more than two papers at once?","a":"Currently, it compares two papers per run."},{"q":"Is this tool free?","a":"AI comparison requires an account with an active plan or credits."}]}', NOW(3));

-- methodology-extractor
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-methodology-extractor');
SET @page_methodology_extractor = (SELECT id FROM `Page` WHERE slug = 'tools-methodology-extractor');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_methodology_extractor, 'features', 0, '{"items":["Summarizes methodology into a structured sample/tools/analysis table","Makes it easy to compare methods across papers","AI-powered — requires an account and a plan"]}', '{"items":["Summarizes methodology into a structured sample/tools/analysis table","Makes it easy to compare methods across papers","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_methodology_extractor, 'faq', 1, '{"items":[{"q":"What does the output look like?","a":"A structured table covering sample, tools, and analysis approach."},{"q":"Does this work for qualitative research too?","a":"Yes, both quantitative and qualitative methodology sections are supported."},{"q":"Is this tool free?","a":"AI extraction requires an account with an active plan or credits."}]}', '{"items":[{"q":"What does the output look like?","a":"A structured table covering sample, tools, and analysis approach."},{"q":"Does this work for qualitative research too?","a":"Yes, both quantitative and qualitative methodology sections are supported."},{"q":"Is this tool free?","a":"AI extraction requires an account with an active plan or credits."}]}', NOW(3));

-- presentation-outline
INSERT INTO `Page` (`id`, `slug`) VALUES (UUID(), 'tools-presentation-outline');
SET @page_presentation_outline = (SELECT id FROM `Page` WHERE slug = 'tools-presentation-outline');
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_presentation_outline, 'features', 0, '{"items":["Turns a paper into slide-ready talking points","Organized in a logical presentation flow","AI-powered — requires an account and a plan"]}', '{"items":["Turns a paper into slide-ready talking points","Organized in a logical presentation flow","AI-powered — requires an account and a plan"]}', NOW(3));
INSERT INTO `ContentSection` (`id`, `pageId`, `sectionKey`, `order`, `draftFields`, `publishedFields`, `updatedAt`)
VALUES (UUID(), @page_presentation_outline, 'faq', 1, '{"items":[{"q":"Does this generate actual slides?","a":"It generates the talking points and structure — you build the slides."},{"q":"How long is the resulting outline?","a":"It scales to the paper’s length, covering its key points."},{"q":"Is this tool free?","a":"AI generation requires an account with an active plan or credits."}]}', '{"items":[{"q":"Does this generate actual slides?","a":"It generates the talking points and structure — you build the slides."},{"q":"How long is the resulting outline?","a":"It scales to the paper’s length, covering its key points."},{"q":"Is this tool free?","a":"AI generation requires an account with an active plan or credits."}]}', NOW(3));

