import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login';

test('authentication flow reads credentials from env and asserts post-login', async ({ page }) => {
  const targetUrl = 'https://mycambrian.cambriancollege.ca/web/cambrian-home/student';

  // Read credentials from environment variables (CI or local .env)
  const username = process.env.MYCAMBRIAN_USERNAME;
  const password = process.env.MYCAMBRIAN_PASSWORD;
  if (!username || !password) {
    throw new Error(
      'Missing credentials: set MYCAMBRIAN_USERNAME and MYCAMBRIAN_PASSWORD environment variables or create tests/.env from tests/.env.example'
    );
  }

  // Navigate to the student landing; this should redirect to CAS login when not authenticated
  await page.goto(targetUrl);
  await page.waitForLoadState('domcontentloaded');

  // Use LoginPage page object for interactions
  const loginPage = new LoginPage(page);

  // Ensure inputs are visible
  await page.locator(loginPage.usernameSelector).waitFor({ state: 'visible', timeout: 15000 });
  await page.locator(loginPage.passwordSelector).waitFor({ state: 'visible', timeout: 15000 });

  // Fill and assert values (immediate verification)
  await loginPage.enterUsername(username);
  await expect(page.locator(loginPage.usernameSelector)).toHaveValue(username);

  await loginPage.enterPassword(password);
  await expect(page.locator(loginPage.passwordSelector)).toHaveValue(password);

  // Submit the form and wait for the navigation to finish
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
    loginPage.clickLoginButton(),
  ]);

  // After login submission, assert known post-login indicators
  const successBanner = page.locator('text=Inicio de sesión correcto. Ha');
  const studentMenu = page.getByRole('menuitem', { name: 'Page Icon Student' });

  let loggedIn = false;
  try {
    await successBanner.waitFor({ state: 'visible', timeout: 10000 });
    loggedIn = true;
  } catch {
    // ignore and try alternate indicator
  }

  if (!loggedIn) {
    try {
      await studentMenu.waitFor({ state: 'visible', timeout: 10000 });
      loggedIn = true;
    } catch {
      // still not logged in
    }
  }

  expect(loggedIn, 'Expected to be logged in after submitting credentials').toBeTruthy();
});
