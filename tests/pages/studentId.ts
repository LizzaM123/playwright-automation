import { Page } from '@playwright/test';

export class StudentIdPage {
  readonly page: Page;
  readonly studentMenuSelector = 'a[href="https://mycambrian.cambriancollege.ca/web/cambrian-home/student"][role="menuitem"]';
  readonly iframeId = '_48_INSTANCE_TJ5WDS9opRF5_iframe';
  readonly cardDivSelector = 'div.cc-card';
  readonly expectedCardUrl = 'https://cf.cambriancollege.ca/student_barcode/print_barcode.cfm';

  constructor(page: Page) {
    this.page = page;
  }

  async clickStudentMenu() {
    await this.page.locator(this.studentMenuSelector).click();
  }

  async getIframeLocator() {
    // Wait for the iframe to be present
    const iframeLocator = this.page.frameLocator(`#${this.iframeId}`);
    await this.page.locator(`#${this.iframeId}`).waitFor({ state: 'attached', timeout: 15000 });
    return iframeLocator;
  }

  async getPrintBarcodeLinkLocator() {
    // Look for the link inside the iframe by its href attribute
    const iframeLocator = await this.getIframeLocator();
    return iframeLocator.locator('a[href*="student_barcode/print_barcode"]');
  }

  async getAllPageText(): Promise<string | null> {
    return this.page.textContent('body');
  }

  async getAllLinks() {
    const links = await this.page.locator('a').all();
    const linkTexts: string[] = [];
    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      linkTexts.push(`${text?.trim() || 'no-text'} [${href || 'no-href'}]`);
    }
    return linkTexts;
  }

  async printBarcodeLinkExists(): Promise<boolean> {
    const link = await this.getPrintBarcodeLinkLocator();
    return (await link.count()) > 0;
  }

  async clickPrintBarcodeLink() {
    const link = await this.getPrintBarcodeLinkLocator();
    await link.click();
  }

  async verifyCardDivExists(): Promise<boolean> {
    const cardDiv = this.page.locator(this.cardDivSelector);
    return (await cardDiv.count()) > 0;
  }

  async waitForPrintBarcodeLink(timeout: number = 20000) {
    const link = await this.getPrintBarcodeLinkLocator();
    await link.waitFor({ state: 'visible', timeout });
    return link;
  }
}
