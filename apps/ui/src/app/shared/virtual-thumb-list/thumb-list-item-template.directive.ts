import { Directive, inject, TemplateRef } from '@angular/core';

@Directive({ selector: '[thumbListItemTemplate]' })
export class ThumbListItemTemplateDirective {
    public readonly template = inject(TemplateRef);
}