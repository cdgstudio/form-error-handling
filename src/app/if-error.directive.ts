import { Directive, OnChanges, OnDestroy, Input, ViewContainerRef, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription, startWith } from 'rxjs';

@Directive({
  selector: '[appIfError]',
})
export class IfErrorDirective<T = unknown> implements OnChanges, OnDestroy {
  @Input('appIfError') errorKey!: string;
  @Input('appIfErrorIn') control!: AbstractControl;

  private activeSubscription = new Subscription();

  constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<{ appIfError: T }>) {}

  ngOnChanges() {
    this.activeSubscription.unsubscribe();
    this.activeSubscription = this.control.valueChanges.pipe(startWith(this.control.value)).subscribe(() => {
      if (this.shouldShowError()) {
        if (this.isErrorVisible() === false) {
          this.showError();
        }
      } else {
        this.removeError();
      }
    });
  }

  ngOnDestroy() {
    this.activeSubscription.unsubscribe();
  }

  private shouldShowError(): boolean {
    return this.control.pristine === false && this.control.hasError(this.errorKey);
  }

  private isErrorVisible(): boolean {
    return this.viewContainer.get(0) !== null;
  }

  private showError(): void {
    const context = this.control.getError(this.errorKey);
    this.viewContainer.createEmbeddedView(this.templateRef, {
      appIfError: context,
    });
  }

  private removeError(): void {
    this.viewContainer.clear();
  }
}