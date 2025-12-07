import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login';
import { MoodlePage } from './pages/moodle';

test('navigate to moodle then to Dashboard and verify dashboard contents', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  const targetUrl = 'https://mycambrian.cambriancollege.ca/web/cambrian-home/student';

  const username = process.env.MYCAMBRIAN_USERNAME;
  const password = process.env.MYCAMBRIAN_PASSWORD;
  if (!username || !password) {
    throw new Error('Missing credentials: set MYCAMBRIAN_USERNAME and MYCAMBRIAN_PASSWORD environment variables');
  }

  // Go to login and sign in
  await page.goto(targetUrl);
  await page.waitForLoadState('domcontentloaded');

  const loginPage = new LoginPage(page);
  await page.locator(loginPage.usernameSelector).waitFor({ state: 'visible', timeout: 15000 });
  await page.locator(loginPage.passwordSelector).waitFor({ state: 'visible', timeout: 15000 });
  await loginPage.enterUsername(username);
  await loginPage.enterPassword(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
    loginPage.clickLoginButton(),
  ]);

  // Ensure logged in
  const successBanner = page.locator('text=Inicio de sesión correcto. Ha');
  const studentMenu = page.getByRole('menuitem', { name: 'Page Icon Student' });
  let loggedIn = false;
  try {
    await successBanner.waitFor({ state: 'visible', timeout: 10000 });
    loggedIn = true;
  } catch {}
  if (!loggedIn) {
    try {
      await studentMenu.waitFor({ state: 'visible', timeout: 10000 });
      loggedIn = true;
    } catch {}
  }
  expect(loggedIn).toBeTruthy();

  // Open Moodle in new tab
  const moodlePage = new MoodlePage(page);
  await moodlePage.waitForMoodleMenu(15000);
  const newPagePromise = context.waitForEvent('page');
  await moodlePage.clickMoodleMenu();
  const moodleTab = await newPagePromise;
  await moodleTab.waitForLoadState('domcontentloaded');

  // Verify moodle loaded
  expect(moodleTab.url()).toContain('moodle.cambriancollege.ca');

  // Click Dashboard link inside Moodle (li[data-key="myhome"] a[href*="/my/"])
  const dashboardLocator = moodleTab.locator('li[data-key="myhome"] a[href*="/my/"]', { hasText: 'Dashboard' });
  await dashboardLocator.waitFor({ state: 'visible', timeout: 15000 });
  await Promise.all([
    moodleTab.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }),
    dashboardLocator.click(),
  ]);

  // Verify dashboard header h1 with text "Dashboard" and class contains "h2"
  const dashboardHeading = moodleTab.locator('h1', { hasText: 'Dashboard' });
  await dashboardHeading.waitFor({ state: 'visible', timeout: 10000 });
  const classAttr = await dashboardHeading.getAttribute('class');
  expect(classAttr, 'Expected h1 to have class containing h2').toContain('h2');

  // Verify Timeline exists as h3.h5.card-title.d-inline
  const timelineLocator = moodleTab.locator('h3.h5.card-title.d-inline', { hasText: 'Timeline' });
  await timelineLocator.waitFor({ state: 'visible', timeout: 10000 });
  expect(await timelineLocator.isVisible()).toBeTruthy();

  // Cleanup
  await moodleTab.close();
  await context.close();
});