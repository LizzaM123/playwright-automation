import { Page } from '@playwright/test';

export class MoodlePage {
  readonly page: Page;
  readonly moodleMenuSelector = 'li.item4 a[href*="moodle.cambriancollege.ca"]';
  readonly expectedMoodleUrl = 'https://moodle.cambriancollege.ca/';

  constructor(page: Page) {
    this.page = page;
  }

  async getMoodleMenuLocator() {
    return this.page.locator(this.moodleMenuSelector);
  }

  async moodleMenuExists(): Promise<boolean> {
    const menu = await this.getMoodleMenuLocator();
    return (await menu.count()) > 0;
  }

  async waitForMoodleMenu(timeout: number = 15000) {
    const menu = await this.getMoodleMenuLocator();
    await menu.waitFor({ state: 'visible', timeout });
    return menu;
  }

  async clickMoodleMenu() {
    const menu = await this.getMoodleMenuLocator();
    await menu.click();
  }

  async getAllMenuItems() {
    const items = await this.page.locator('li[class*="item"]').all();
    const itemTexts: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      const link = await item.locator('a').first();
      const href = await link.getAttribute('href');
      itemTexts.push(`${text?.trim() || 'no-text'} [${href || 'no-href'}]`);
    }
    return itemTexts;
  }
}
