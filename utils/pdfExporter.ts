import { Slide } from '../types';
import { amiriFont } from '../components/Amiri-Regular';
import { amiriBoldFont } from '../components/Amiri-Bold';

export const exportSlidesToPDF = (slides: Slide[], topic: string) => {
    // @ts-ignore
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Add Amiri fonts to jsPDF
    doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFileToVFS('Amiri-Bold.ttf', amiriBoldFont);
    doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');

    slides.forEach((slide, index) => {
        if (index > 0) doc.addPage();
        
        doc.setFont('Amiri', 'bold');
        doc.setR2L(true); // Enable Right-to-Left
        doc.setFontSize(24);
        doc.text(slide.title, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });

        doc.setFont('Amiri', 'normal');
        doc.setFontSize(14);
        const contentLines = slide.content.split('\n').map(line => line.replace(/^- /, ''));
        doc.text(contentLines, doc.internal.pageSize.getWidth() - 20, 60, { align: 'right' });

        // Footer
        doc.setFontSize(10);
        doc.text(`الشريحة ${index + 1} من ${slides.length}`, 15, doc.internal.pageSize.getHeight() - 10, { align: 'left' });
        doc.text(`تم إنشاؤه بواسطة MZ`, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    });

    doc.save(`${topic.replace(/\s+/g, '_')}_presentation.pdf`);
};