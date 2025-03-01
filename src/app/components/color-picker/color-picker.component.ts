import {
  Component,
  input,
  output,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import colorConfig from '../../config/colors.json';
import { ColorConfig } from '../../config/colors.type';

@Component({
  selector: 'app-color-picker',
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css'],
})
export class ColorPickerComponent {
  // Inputs and outputs
  selectedColor = input<string>(colorConfig.defaultColor);
  colorSelected = output<string>();

  // ViewChild references
  @ViewChild('colorButton') colorButton!: ElementRef;

  // Signals
  isMenuOpen = signal(false);
  menuPosition = signal({ top: '0px', left: '0px' });

  // Config
  colorConfig: ColorConfig = colorConfig;

  // Services
  private elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isMenuOpen.set(false);
    }
  }

  toggleMenu(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    this.isMenuOpen.update((isOpen) => !isOpen);

    if (this.isMenuOpen()) {
      setTimeout(() => this.positionMenu(), 0);
    }
  }

  positionMenu(): void {
    const buttonElement = this.colorButton.nativeElement;
    const rect = buttonElement.getBoundingClientRect();

    // Position the menu above the button
    const menuTop = rect.top - 220; // Height of menu + some margin
    const menuLeft = rect.left + rect.width / 2 - 100; // Center the menu (200px width / 2)

    // Adjust if menu would go off screen
    const adjustedLeft = Math.max(
      10,
      Math.min(menuLeft, window.innerWidth - 210)
    );
    const adjustedTop = Math.max(10, menuTop);

    this.menuPosition.set({
      top: `${adjustedTop}px`,
      left: `${adjustedLeft}px`,
    });
  }

  selectColor(color: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.colorSelected.emit(color);
    this.isMenuOpen.set(false);
  }

  getColorName(colorValue: string): string {
    const color = this.colorConfig.colorOptions.find(
      (c) => c.value === colorValue
    );
    return color ? color.name : 'Unknown';
  }
}
