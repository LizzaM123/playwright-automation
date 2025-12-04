import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
//   await page.goto('https://ban-lum53a-prd.cambriancollege.ca:8447/cas-web/login?service=https%3A%2F%2Fmycambrian.cambriancollege.ca%2Fc%2Fportal%2Flogin');
  await page.goto('https://ban-lum53a-prd.cambriancollege.ca:8447/cas-web/login');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: 'NetID:' }).click();
  await page.getByRole('textbox', { name: 'NetID:' }).fill('A00325183');
  await page.getByRole('textbox', { name: 'NetID:' }).press('Tab');
  await page.getByRole('textbox', { name: 'Contraseña:' }).click();
  await page.getByRole('textbox', { name: 'Contraseña:' }).fill('');
  await page.getByRole('textbox', { name: 'Contraseña:' }).press('Enter');
  
  // Wait for the login submission to complete
  await page.waitForNavigation();
  
  // Verify the assertions after successful login
  await expect(page.getByRole('menuitem', { name: 'Page Icon Student' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Page Icon Moodle' }).click();
});