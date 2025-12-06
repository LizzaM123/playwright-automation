import { Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginButton = 'input[type="submit"]';
  readonly usernameSelector = '#username';
  readonly passwordSelector = '#password';

  constructor(page: Page) {
    this.page = page;
  }

  async enterUsername(username: string) {
    await this.page.locator(this.usernameSelector).fill(username);
  }

  async enterPassword(password: string) {
    await this.page.locator(this.passwordSelector).fill(password);
  }

  async clickLoginButton() {
    await this.page.click(this.loginButton);
  }

  async login(username: string, password: string) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }
}
