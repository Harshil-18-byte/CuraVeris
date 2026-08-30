import { test, expect } from '@playwright/test';

test.describe('Empty-Result Scenarios & Analytics Assertions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
  });

  test('should render empty state and fire analytics when non-existent item is queried', async ({ page }) => {
    const searchInput = page.locator('#benchmark-search-input');
    const searchBtn = page.locator('#benchmark-search-btn');

    // Type a non-existent medical term
    const testQuery = 'NonExistentDrugXYZ999';
    await searchInput.fill(testQuery);
    await searchBtn.click();

    // Verify empty state panel renders
    const emptyPanel = page.locator('#benchmark-empty-panel');
    await expect(emptyPanel).toBeVisible();
    await expect(emptyPanel).toContainText('[NO STATUTORY RECORDS MATCHED]');

    // Verify Retry button is present in empty state
    const retryBtn = page.locator('#benchmark-empty-retry-btn');
    await expect(retryBtn).toBeVisible();

    // Inspect analytics events recorded on window object
    const analyticsEvents = await page.evaluate(() => {
      return (window as any).__CURAVERIS_ANALYTICS_EVENTS__ || [];
    });

    // 1. Assert search_query_executed event fired with correct parameters
    const queryEvent = analyticsEvents.find(
      (e: any) => e.event_name === 'search_query_executed' && e.payload?.query === testQuery
    );
    expect(queryEvent).toBeDefined();
    expect(queryEvent?.payload?.query).toBe(testQuery);
    expect(queryEvent?.timestamp).toBeTruthy();

    // 2. Assert empty_result_rendered event fired with correct parameters
    const emptyEvent = analyticsEvents.find(
      (e: any) => e.event_name === 'empty_result_rendered' && e.payload?.query === testQuery
    );
    expect(emptyEvent).toBeDefined();
    expect(emptyEvent?.payload?.result_count).toBe(0);
    expect(emptyEvent?.payload?.latency_ms).toBeGreaterThanOrEqual(0);
  });

  test('should trigger retry query on clicking retry button in empty state', async ({ page }) => {
    const searchInput = page.locator('#benchmark-search-input');
    const searchBtn = page.locator('#benchmark-search-btn');

    await searchInput.fill('AnotherEmptyDrug456');
    await searchBtn.click();

    const retryBtn = page.locator('#benchmark-empty-retry-btn');
    await expect(retryBtn).toBeVisible();

    // Click retry
    await retryBtn.click();

    // Verify that another query execution event was dispatched
    const analyticsEvents = await page.evaluate(() => {
      return (window as any).__CURAVERIS_ANALYTICS_EVENTS__ || [];
    });

    const queryEvents = analyticsEvents.filter(
      (e: any) => e.event_name === 'search_query_executed' && e.payload?.query === 'AnotherEmptyDrug456'
    );
    expect(queryEvents.length).toBeGreaterThanOrEqual(2);
  });
});
