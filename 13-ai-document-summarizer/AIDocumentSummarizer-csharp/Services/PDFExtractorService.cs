using System.Text;
using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;

namespace AIDocumentSummarizer.Services;

public class PDFExtractorService
{
    public string SummarizeFromStream(Stream pdfStream)
    {
        var textBuilder = new StringBuilder();

        using (var document = PdfDocument.Open(pdfStream))
        {
            foreach (var page in document.GetPages())
            {

                string pageText = ContentOrderTextExtractor.GetText(page);

                textBuilder.Append(pageText);
            }
        }
        
        return textBuilder.ToString().Trim();
    }
}