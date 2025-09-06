import { WebTechStack } from '../types';

export const exportToCodePen = (code: string, title: string, techStack: WebTechStack | undefined) => {
    if (!code) return;

    // الإعداد الافتراضي لـ tailwind إذا كان techStack غير محدد لبعض الإنشاءات القديمة
    const effectiveTechStack = techStack || 'tailwind';

    const data = {
        title: `موقع لـ: ${title}`,
        html: effectiveTechStack.startsWith('html') || effectiveTechStack === 'tailwind' ? code : '',
        js: effectiveTechStack === 'react-tailwind' ? code : '',
        js_pre_processor: effectiveTechStack === 'react-tailwind' ? 'babel' : 'none',
        html_pre_processor: 'none',
        css_pre_processor: 'none',
        // بالنسبة لـ tailwind، نحتاج إلى إضافة رابط CDN
        html_head: effectiveTechStack === 'tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : '',
    };

    const form = document.createElement('form');
    form.action = 'https://codepen.io/pen/define';
    form.method = 'POST';
    form.target = '_blank';
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify(data);

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};