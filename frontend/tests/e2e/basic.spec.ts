import { test, expect } from '@playwright/test';

test('home loads and has tabs', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/منصة التحليل القانوني الذكي|Next.js/);
  await expect(page.getByText('إدخال البيانات')).toBeVisible();
  await expect(page.getByText('مراحل التحليل')).toBeVisible();
  await expect(page.getByText('النتائج')).toBeVisible();
});

test('exports page accessible from header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '⬇️ الصادرات' }).click();
  await expect(page.getByText('سجل التصدير')).toBeVisible();
});


