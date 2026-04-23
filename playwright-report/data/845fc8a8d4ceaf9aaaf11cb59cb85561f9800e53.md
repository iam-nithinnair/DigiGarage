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
        - link "Home" [ref=e6]:
          - /url: /DigiGarage
          - img [ref=e7]
          - text: Home
        - link "Collection" [ref=e10]:
          - /url: /DigiGarage/collection
          - img [ref=e11]
          - text: Collection
        - link "Discover" [ref=e16]:
          - /url: /DigiGarage/discover
          - img [ref=e17]
          - text: Discover
        - link "ISO" [ref=e20]:
          - /url: /DigiGarage/iso
          - img [ref=e21]
          - text: ISO
        - link "Favorites" [ref=e22]:
          - /url: /DigiGarage/favorites
          - img [ref=e23]
          - text: Favorites
        - link "Developer" [ref=e25]:
          - /url: /DigiGarage/developer
          - img [ref=e26]
          - text: Developer
      - generic [ref=e28]:
        - button "Search Collection" [ref=e29]:
          - img [ref=e30]
        - link "Login" [ref=e33]:
          - /url: /DigiGarage/login
          - img [ref=e34]
  - main [ref=e37]:
    - generic [ref=e38]:
      - img "Close-up of a high-detail 1:18 scale red Ferrari racing car" [ref=e40]
      - generic [ref=e42]:
        - generic [ref=e43]:
          - generic [ref=e44]: Premium Heritage
          - heading "Your Digital Garage, Perfected." [level=1] [ref=e45]:
            - text: Your Digital Garage,
            - text: Perfected.
        - paragraph [ref=e46]: Archiving automotive legends with surgical precision. The definitive platform for the modern scale model collector.
        - link "Explore Collection" [ref=e48]:
          - /url: /DigiGarage/collection
          - text: Explore Collection
          - img [ref=e49]
    - generic [ref=e52]:
      - heading "My Collections" [level=2] [ref=e54]
      - link "View All" [ref=e57]:
        - /url: /DigiGarage/collection
    - generic [ref=e59]:
      - generic [ref=e60]:
        - generic [ref=e61]: Wishlist
        - heading "In Search Of" [level=2] [ref=e62]
        - link "View All ISO" [ref=e63]:
          - /url: /DigiGarage/iso
      - generic [ref=e65]: No items in your wishlist yet.
    - generic [ref=e66]:
      - generic [ref=e67]:
        - generic [ref=e68]:
          - heading "The Favorites" [level=2] [ref=e69]
          - paragraph [ref=e70]: The crown jewels of the collection. Curated for their historical significance, technical complexity, and sheer beauty.
        - link "View All Favorites" [ref=e71]:
          - /url: /DigiGarage/favorites
          - text: View All Favorites
          - img [ref=e72]
      - generic [ref=e75]: No favorites right now. Check back when you find a crown jewel!
  - contentinfo [ref=e76]:
    - generic [ref=e77]:
      - generic [ref=e78]:
        - generic [ref=e79]: THE DIGITAL CURATOR
        - generic [ref=e80]: © 2024 THE DIGITAL CURATOR. PRECISION ENGINEERED.
      - generic [ref=e81]:
        - link "Terms of Service" [ref=e82]:
          - /url: "#"
        - link "Privacy Policy" [ref=e83]:
          - /url: "#"
        - link "Contact Support" [ref=e84]:
          - /url: "#"
        - link "Archive" [ref=e85]:
          - /url: "#"
      - generic [ref=e86]:
        - button [ref=e87]:
          - img [ref=e88]
        - button [ref=e94]:
          - img [ref=e95]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e103] [cursor=pointer]:
    - img [ref=e104]
  - alert [ref=e109]
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