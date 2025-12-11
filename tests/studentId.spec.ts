import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login';
import { StudentIdPage } from './pages/studentId';

// Logs into MyCambrian and navigates to the Student ID print barcode page through the Student menu.
// Verifies the student ID card container element is visible on the page.
test('student id card print page displays cc-card div after successful login and navigation', async ({ browser }) => {
  // Create a context to manage multiple pages
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

  // Use StudentIdPage page object
  const studentIdPage = new StudentIdPage(page);

  // Click the Student menu
  await studentIdPage.clickStudentMenu();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Wait for the print barcode link to be visible
  await studentIdPage.waitForPrintBarcodeLink(30000);

  // Handle new page and click print barcode link
  const newPagePromise = context.waitForEvent('page');
  await studentIdPage.clickPrintBarcodeLink();
  const newPage = await newPagePromise;

  // Wait for the new page to load
  await newPage.waitForLoadState('domcontentloaded');

  // Verify the new page has the expected URL
  expect(newPage.url()).toContain('cf.cambriancollege.ca/student_barcode/print_barcode.cfm');

  // Verify the cc-card div exists on the new page
  const cardDivExists = await newPage.locator('div.cc-card').count() > 0;
  expect(cardDivExists, 'Expected to find div.cc-card on the print barcode page').toBeTruthy();

  // Clean up
  await newPage.close();
  await context.close();
});
