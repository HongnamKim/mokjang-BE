import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isSanitizeDto } from '../decorator/sanitize-target.decorator';
import { plainToInstance } from 'class-transformer';
import xss from 'xss';

function sanitizeRecursively(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeRecursively);
  }

  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'string') {
        obj[key] = sanitizedQuillHTML(value);
      } else if (typeof value === 'object') {
        obj[key] = sanitizeRecursively(value);
      }
    }
    return obj;
  }

  return obj;
}

const sanitizedQuillHTML = (html: string): string => {
  const options = {
    whiteList: {
      a: ['href', 'title', 'target', 'rel'],
      b: [],
      i: [],
      u: [],
      strong: [],
      em: [],
      p: [],
      br: [],
      div: ['style'],
      span: ['style'],
      ul: [],
      ol: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      pre: [],
      code: [],
      blockquote: [],
      img: ['src', 'alt', 'width', 'height'],
    },
    stripIgnoreTag: true, // 허용되지 않은 태그 제거
    stripIgnoreTagBody: ['script', 'style', 'iframe'], // script, style, iframe 내용까지 제거
    css: {
      whiteList: {
        color: true,
        'background-color': true,
        'text-align': true,
        'font-weight': true,
        'font-style': true,
        'text-decoration': true,
      },
    },
  };

  return xss(html, options);
};

@Injectable()
export class XssSanitizerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const { metatype } = metadata;
    if (!metatype || !isSanitizeDto(metatype)) {
      return value;
    }

    if (!value || typeof value !== 'object') return value;

    const instance = plainToInstance(metatype, value);

    return sanitizeRecursively(instance);
  }
}
