import { expect, test } from "@playwright/test";

test("plans a weekend end to end with sample data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Plan my weekend" }).first().click();

  // 1. Location
  await expect(page.getByRole("heading", { name: "Where are you?" })).toBeVisible();
  await page.getByLabel("City or ZIP code").fill("Blue Bell, PA");
  await page.getByText("10 miles", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // 2. Interests
  await expect(page.getByRole("heading", { name: "What are you into?" })).toBeVisible();
  await page.getByText("Live music", { exact: true }).click();
  await page.getByText("Food and drink", { exact: true }).click();
  await page.getByRole("button", { name: "Next" }).click();

  // 3. Event types
  await expect(page.getByRole("heading", { name: "What do you like to do?" })).toBeVisible();
  for (const type of ["Concerts", "Bars and breweries", "Restaurants"]) {
    await page.getByText(type, { exact: true }).click();
  }
  await page.getByRole("button", { name: "Next" }).click();

  // 4. Group size (defaults to 4)
  await expect(page.getByRole("heading", { name: "How many of you?" })).toBeVisible();
  await page.getByRole("button", { name: "One more person" }).click();
  await expect(page.getByLabel("People going")).toHaveValue("5");
  await page.getByRole("button", { name: "Next" }).click();

  // 5. Budget
  await expect(page.getByRole("heading", { name: "What's the budget?" })).toBeVisible();
  const presets = page.getByRole("group", { name: "Or pick one" });
  await presets.getByText("Under $100", { exact: true }).click();
  await expect(page.getByText("Up to $500 for your group of 5.")).toBeVisible();
  await presets.getByText("Under $50", { exact: true }).click();
  await expect(page.getByText("Up to $250 for your group of 5.")).toBeVisible();
  await page.getByRole("button", { name: "Pick dates" }).click();

  // Dates + summary
  await expect(page.getByRole("heading", { name: "When are you going out?" })).toBeVisible();
  await expect(page.getByText("Blue Bell, PA, within 10 miles")).toBeVisible();
  await page.getByRole("button", { name: "Plan my weekend" }).click();

  // Results
  await expect(page).toHaveURL(/\/results\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole("heading", { level: 1, name: /Your weekend near Blue Bell, PA/ }),
  ).toBeVisible();
  await expect(page.getByText("Sample data.")).toBeVisible();

  const cards = page.getByRole("article");
  const count = await cards.count();
  expect(count).toBeGreaterThanOrEqual(5);
  expect(count).toBeLessThanOrEqual(10);
  await expect(cards.first().getByText("Why this fits:")).toBeVisible();

  // Filters narrow the list
  await page.getByLabel("Category").selectOption("restaurant");
  await expect(page.getByText(/^Showing \d+ of \d+ picks$/)).toBeVisible();
  const restaurantCards = await cards.count();
  expect(restaurantCards).toBeLessThan(count);
  for (const card of await cards.all()) {
    await expect(card.getByText("Restaurant", { exact: true })).toBeVisible();
  }

  // The plan survives a reload on this device
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: /Your weekend near Blue Bell, PA/ }),
  ).toBeVisible();
});

test("a step will not continue until it is valid", async ({ page }) => {
  await page.goto("/onboarding/interests");
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Pick at least one interest or describe one")).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding\/interests$/);
});

test("the plan page sends new users to onboarding", async ({ page }) => {
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: "A few questions first" })).toBeVisible();
  await page.getByRole("link", { name: "Continue setup" }).click();
  await expect(page).toHaveURL(/\/onboarding\/location$/);
});
