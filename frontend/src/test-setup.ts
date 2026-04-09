import '@analogjs/vitest-angular/setup-zone';
import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { NgModule } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [TranslateModule.forRoot()],
	providers: [provideRouter([]), provideHttpClientTesting()]
})
class TestingProvidersModule {}

setupTestBed({
	zoneless: false,
	providers: [TestingProvidersModule]
});

globalThis.scrollTo = () => {};

if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}
