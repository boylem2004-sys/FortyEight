import { expect, test } from "@playwright/test";

test("plans a weekend end to end with sample data", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Start planning your weekend" }).first().click();

  // 1. Location
  await expect(page.getByRole("heading", { name: "Where are you?" })).toBeVisible();
  await page.getByLabel("City or ZIP code").fill("Blue Bell, PA");
  await page.getByText("10 miles", { exact: true }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // 2. What sounds good
  await expect(page.getByRole("heading", { name: "What sounds good?" })).toBeVisible();
  for (const type of ["Concerts", "Bars and breweries", "Restaurants"]) {
    await page.getByText(type, { exact: true }).click();
  }
  await page.getByRole("button", { name: "Next", exact: true }).click();

  // 3. Group size (defaults to 4) and budget
  await expect(
    page.getByRole("heading", { name: "Who's in, and what's the budget?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "One more person" }).click();
  await expect(page.getByLabel("People going")).toHaveValue("5");
  const presets = page.getByRole("group", { name: /Budget per person/ });
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
  await page.goto("/onboarding/activities");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Pick at least one")).toBeVisible();
  await expect(page).toHaveURL(/\/onboarding\/activities$/);
});

test("old step links land on the new screens", async ({ page }) => {
  await page.goto("/onboarding/budget");
  await expect(page).toHaveURL(/\/onboarding\/group$/);
});

test("the plan page sends new users to onboarding", async ({ page }) => {
  await page.goto("/plan");
  await expect(page.getByRole("heading", { name: "A few questions first" })).toBeVisible();
  await page.getByRole("link", { name: "Continue setup" }).click();
  await expect(page).toHaveURL(/\/onboarding\/location$/);
});
