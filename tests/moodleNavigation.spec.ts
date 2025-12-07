import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login';
import { MoodlePage } from './pages/moodle';

test('navigation to moodle after login opens new tab with correct url', async ({ browser }) => {
  // Create a context to manage multiple pages/tabs
  const context = await browser.newContext();
  const page = await context.newPage();

  const targetUrl = 'https://mycambrian.cambriancollege.ca/web/cambrian-home/student';

  // Read credentials from environment variables
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

  // Use LoginPage page object to log in
  const loginPage = new LoginPage(page);

  // Ensure inputs are visible
  await page.locator(loginPage.usernameSelector).waitFor({ state: 'visible', timeout: 15000 });
  await page.locator(loginPage.passwordSelector).waitFor({ state: 'visible', timeout: 15000 });

  // Fill credentials and submit
  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);

  // Submit the form and wait for navigation to complete
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
    loginPage.clickLoginButton(),
  ]);

  // Verify post-login indicators
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

  // Use MoodlePage page object
  const moodlePage = new MoodlePage(page);

  // Wait for the Moodle menu to be visible
  await moodlePage.waitForMoodleMenu(15000);

  // Listen for new page/tab before clicking
  const newPagePromise = context.waitForEvent('page');
  await moodlePage.clickMoodleMenu();
  const newPage = await newPagePromise;

  // Wait for the new page to load
  await newPage.waitForLoadState('domcontentloaded');

  // Verify the new page has navigated to Moodle
  expect(newPage.url()).toContain('moodle.cambriancollege.ca');

  // Verify the greeting message is displayed
  const greetingHeading = newPage.locator('h2:has-text("Hi, Lizza!")');
  await expect(greetingHeading).toBeVisible();

  // Clean up
  await newPage.close();
  await context.close();
});
