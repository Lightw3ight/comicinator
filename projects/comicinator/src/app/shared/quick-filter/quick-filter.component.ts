import { Component, model, OnInit, signal } from '@angular/core';

const LETTERS = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
];

@Component({
    selector: 'cbx-quick-filter',
    templateUrl: 'quick-filter.component.html',
    styleUrl: 'quick-filter.component.scss',
})
export class QuickFilterComponent {
    public activeFilter = model<string>('a');

    protected filterValues = signal(LETTERS);
}
