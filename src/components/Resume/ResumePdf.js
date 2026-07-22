import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// react-pdf (and pdf.js) is heavy, so this component is imported lazily by
// ResumeNew — it only downloads once the visitor actually reveals the resume,
// keeping it out of the initial bundle for everyone else.
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function ResumePdf({ file, width, loading }) {
  return (
    <Document file={file} loading={loading}>
      <Page
        pageNumber={1}
        width={width}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );
}

export default ResumePdf;
