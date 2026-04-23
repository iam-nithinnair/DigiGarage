# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: example.spec.ts >> navbar links are visible
- Location: tests\example.spec.ts:10:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /Collection/i })
Expected: visible
Error: strict mode violation: getByRole('link', { name: /Collection/i }) resolved to 2 elements:
    1) <a href="/DigiGarage/collection" class="transition-colors ease-out duration-200 font-headline text-[#e2e2e5] hover:text-[#D40000] flex items-center gap-1 text-xs uppercase tracking-widest font-bold">…</a> aka getByRole('link', { name: 'Collection', exact: true })
    2) <a href="/DigiGarage/collection" class="px-8 py-4 bg-primary-container text-on-primary-container font-headline font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">…</a> aka getByRole('link', { name: 'Explore Collection' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /Collection/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]: THE DIGITAL CURATOR
      - generic [ref=e5]:
        - link "Home" [ref=e6] [cursor=pointer]:
          - /url: /DigiGarage
          - img [ref=e7]
          - text: Home
        - link "Collection" [ref=e10] [cursor=pointer]:
          - /url: /DigiGarage/collection
          - img [ref=e11]
          - text: Collection
        - link "Discover" [ref=e16] [cursor=pointer]:
          - /url: /DigiGarage/discover
          - img [ref=e17]
          - text: Discover
        - link "ISO" [ref=e20] [cursor=pointer]:
          - /url: /DigiGarage/iso
          - img [ref=e21]
          - text: ISO
        - link "Favorites" [ref=e28] [cursor=pointer]:
          - /url: /DigiGarage/favorites
          - img [ref=e29]
          - text: Favorites
        - link "Developer" [ref=e31] [cursor=pointer]:
          - /url: /DigiGarage/developer
          - img [ref=e32]
          - text: Developer
      - generic [ref=e35]:
        - button "Search Collection" [ref=e36]:
          - img [ref=e37]
        - link "Login" [ref=e40] [cursor=pointer]:
          - /url: /DigiGarage/login
          - img [ref=e41]
  - main [ref=e44]:
    - generic [ref=e45]:
      - img "Close-up of a high-detail 1:18 scale red Ferrari racing car" [ref=e47]
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]: Premium Heritage
          - heading "Your Digital Garage, Perfected." [level=1] [ref=e52]:
            - text: Your Digital Garage,
            - text: Perfected.
        - paragraph [ref=e53]: Archiving automotive legends with surgical precision. The definitive platform for the modern scale model collector.
        - link "Explore Collection" [ref=e55] [cursor=pointer]:
          - /url: /DigiGarage/collection
          - text: Explore Collection
          - img [ref=e56]
    - generic [ref=e60]:
      - heading "My Collections" [level=2] [ref=e62]
      - link "View All" [ref=e65] [cursor=pointer]:
        - /url: /DigiGarage/collection
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]: Wishlist
        - heading "In Search Of" [level=2] [ref=e70]
        - link "View All ISO" [ref=e71] [cursor=pointer]:
          - /url: /DigiGarage/iso
      - generic [ref=e73]: No items in your wishlist yet.
    - generic [ref=e74]:
      - generic [ref=e75]:
        - generic [ref=e76]:
          - heading "The Favorites" [level=2] [ref=e77]
          - paragraph [ref=e78]: The crown jewels of the collection. Curated for their historical significance, technical complexity, and sheer beauty.
        - link "View All Favorites" [ref=e79] [cursor=pointer]:
          - /url: /DigiGarage/favorites
          - text: View All Favorites
          - img [ref=e80]
      - generic [ref=e84]: No favorites right now. Check back when you find a crown jewel!
  - contentinfo [ref=e85]:
    - generic [ref=e86]:
      - generic [ref=e87]:
        - generic [ref=e88]: THE DIGITAL CURATOR
        - generic [ref=e89]: © 2024 THE DIGITAL CURATOR. PRECISION ENGINEERED.
      - generic [ref=e90]:
        - link "Terms of Service" [ref=e91] [cursor=pointer]:
          - /url: "#"
        - link "Privacy Policy" [ref=e92] [cursor=pointer]:
          - /url: "#"
        - link "Contact Support" [ref=e93] [cursor=pointer]:
          - /url: "#"
        - link "Archive" [ref=e94] [cursor=pointer]:
          - /url: "#"
      - generic [ref=e95]:
        - button [ref=e96]:
          - img [ref=e97]
        - button [ref=e103]:
          - img [ref=e104]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e113] [cursor=pointer]:
    - img [ref=e114]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('has title', async ({ page }) => {
  4  |   await page.goto('/DigiGarage/');
  5  | 
  6  |   // Expect a title "to contain" a substring.
  7  |   await expect(page).toHaveTitle(/THE DIGITAL CURATOR/);
  8  | });
  9  | 
  10 | test('navbar links are visible', async ({ page }) => {
  11 |   await page.goto('/DigiGarage/');
  12 | 
  13 |   // Check if Home link is visible
  14 |   await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
  15 |   // Check if Collection link is visible
> 16 |   await expect(page.getByRole('link', { name: /Collection/i })).toBeVisible();
     |                                                                 ^ Error: expect(locator).toBeVisible() failed
  17 | });
  18 | 
```