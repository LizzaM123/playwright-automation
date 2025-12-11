import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login';
import { GradeReportPage } from './pages/gradeReport';

// Logs into MyCambrian, navigates to the Student section, and submits the grade report form.
// Verifies the grade report page displays the expected confirmation message.
test('grade report submission displays expected message', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  const targetUrl = 'https://mycambrian.cambriancollege.ca/web/cambrian-home/student';

  const username = process.env.MYCAMBRIAN_USERNAME;
  const password = process.env.MYCAMBRIAN_PASSWORD;
  if (!username || !password) {
    throw new Error('Missing credentials: set MYCAMBRIAN_USERNAME and MYCAMBRIAN_PASSWORD environment variables');
  }

  // Login
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

  // Verify logged in
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

  // Navigate to Student page
  const gradeReportPage = new GradeReportPage(page);
  await gradeReportPage.clickStudentLink();
  await page.waitForLoadState('networkidle');

  // Find and click Grade Report link in new tab
  await gradeReportPage.waitForGradeReportLink(15000);
  const newPagePromise = context.waitForEvent('page');
  await gradeReportPage.clickGradeReportLink();
  const gradeReportTab = await newPagePromise;
  await gradeReportTab.waitForLoadState('domcontentloaded');

  // Switch context to the new tab and submit form
  const gradeReportPageTab = new GradeReportPage(gradeReportTab);
  await gradeReportPageTab.submitForm();
  await gradeReportTab.waitForLoadState('networkidle');

  // Verify the response message
  const responseText = await gradeReportPageTab.getResponseMessage();
  expect(responseText).toContain('You currently don\'t have a grade report to display for term 202507');

  // Cleanup
  await gradeReportTab.close();
  await context.close();
});
