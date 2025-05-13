import { Component } from '@angular/core';

@Component({
    selector: 'button[icon-button]',
    template: '<ng-content></ng-content>',
    styleUrl: 'icon-button.component.scss',
})
export class IconButtonComponent {}
