import { Page } from '@playwright/test';

export class GradeReportPage {
  readonly page: Page;
  readonly studentLinkSelector = 'li.item3 a[href="https://mycambrian.cambriancollege.ca/web/cambrian-home/student"]';
  readonly iframeId = '_48_INSTANCE_2MzfJTNjKk85_iframe';
  readonly gradeReportLinkSelector = 'td a[href="https://cf.cambriancollege.ca/Student/Grade_Report/index.cfm"]';
  readonly submitButtonSelector = 'input[type="submit"][value="Submit"]';
  readonly expectedMessage = 'You currently don\'t have a grade report to display for term 202507. Your grade report will be available once your program has finished.';

  constructor(page: Page) {
    this.page = page;
  }

  async clickStudentLink() {
    const link = this.page.locator(this.studentLinkSelector);
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.click();
  }

  async getIframeLocator() {
    // Wait for the iframe to be present
    const iframeLocator = this.page.frameLocator(`#${this.iframeId}`);
    await this.page.locator(`#${this.iframeId}`).waitFor({ state: 'attached', timeout: 15000 });
    return iframeLocator;
  }

  async waitForGradeReportLink(timeout: number = 15000) {
    const iframeLocator = await this.getIframeLocator();
    const link = iframeLocator.locator(this.gradeReportLinkSelector);
    await link.waitFor({ state: 'visible', timeout });
    return link;
  }

  async clickGradeReportLink() {
    const iframeLocator = await this.getIframeLocator();
    const link = iframeLocator.locator(this.gradeReportLinkSelector);
    await link.click();
  }

  async submitForm() {
    const button = this.page.locator(this.submitButtonSelector);
    await button.waitFor({ state: 'visible', timeout: 10000 });
    await button.click();
  }

  async getResponseMessage(): Promise<string> {
    // Wait for the response to appear on the page
    const messageLocator = this.page.locator('body');
    await messageLocator.waitFor({ state: 'visible', timeout: 10000 });
    return (await this.page.textContent('body')) || '';
  }
}
