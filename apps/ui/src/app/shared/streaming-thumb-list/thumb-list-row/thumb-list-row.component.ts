import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, TemplateRef } from '@angular/core';

@Component({
    selector: 'cbx-thumb-list-row',
    templateUrl: 'thumb-list-row.component.html',
    styleUrl: 'thumb-list-row.component.scss',
    imports: [CommonModule],
})
export class ThumbListRowComponent {
    public readonly data = input<any[] | undefined>();
    public readonly itemTemplate = input.required<TemplateRef<any>>();
}
