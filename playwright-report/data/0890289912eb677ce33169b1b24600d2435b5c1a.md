# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: discover.spec.ts >> Discover Page >> search should filter results
- Location: tests\discover.spec.ts:13:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('article').first()
Expected pattern: /Skyline/i
Received string:  "HW Dream Garage2024Mazda AutozamAcquire"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('article').first()
    9 × locator resolved to <article class="bg-surface-container-low group hover:bg-surface-container transition-all duration-500 border border-white/5 relative overflow-hidden flex flex-col">…</article>
      - unexpected value "HW Dream Garage2024Mazda AutozamAcquire"

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
      - generic [ref=e39]:
        - generic [ref=e40]:
          - img [ref=e41]
          - generic [ref=e44]: Global Archive
        - heading "Discover Castings" [level=1] [ref=e45]
        - paragraph [ref=e46]: Explore the definitive Hot Wheels database. Uncover legendary silhouettes and instantly append them to your private digital museum.
      - generic [ref=e47]:
        - generic [ref=e48]:
          - img [ref=e49]
          - combobox [ref=e51] [cursor=pointer]:
            - option "All" [selected]
            - option "Basic Line"
            - option "Batman"
            - option "Factory Fresh"
            - option "HW Art Cars"
            - option "HW Dream Garage"
            - option "HW Drift"
            - option "HW Exotics"
            - option "HW First Response"
            - option "HW Green Speed"
            - option "HW Hot Trucks"
            - option "HW J-Imports"
            - option "HW Modified"
            - option "HW Rolling Metal"
            - option "HW Screen Time"
            - option "HW Turbo"
            - 'option "HW: The ''90s"'
            - option "Muscle Mania"
            - option "Treasure Hunt"
        - generic [ref=e52]:
          - img [ref=e53]
          - textbox "Search by casting or series..." [active] [ref=e56]
    - generic [ref=e57]:
      - article [ref=e58]:
        - img "Mazda Autozam" [ref=e60]
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]: HW Dream Garage
            - generic [ref=e65]: "2024"
          - heading "Mazda Autozam" [level=3] [ref=e66]
          - button "Acquire" [disabled] [ref=e68]:
            - img [ref=e69]
            - text: Acquire
      - article [ref=e70]:
        - img "Tesla Cybertruck" [ref=e72]
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic [ref=e76]: HW Rolling Metal
            - generic [ref=e77]: "2024"
          - heading "Tesla Cybertruck" [level=3] [ref=e78]
          - button "Acquire" [disabled] [ref=e80]:
            - img [ref=e81]
            - text: Acquire
      - article [ref=e82]:
        - img "McLaren F1" [ref=e84]
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]: "HW: The '90s"
            - generic [ref=e89]: "2024"
          - heading "McLaren F1" [level=3] [ref=e90]
          - button "Acquire" [disabled] [ref=e92]:
            - img [ref=e93]
            - text: Acquire
      - article [ref=e94]:
        - img "Porsche 911 Rallye" [ref=e96]
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic [ref=e100]: HW Turbo
            - generic [ref=e101]: "2024"
          - heading "Porsche 911 Rallye" [level=3] [ref=e102]
          - button "Acquire" [disabled] [ref=e104]:
            - img [ref=e105]
            - text: Acquire
      - article [ref=e106]:
        - img "Gordon Murray Automotive T.50S" [ref=e108]
        - generic [ref=e110]:
          - generic [ref=e111]:
            - generic [ref=e112]: HW Exotics
            - generic [ref=e113]: "2024"
          - heading "Gordon Murray Automotive T.50S" [level=3] [ref=e114]
          - button "Acquire" [disabled] [ref=e116]:
            - img [ref=e117]
            - text: Acquire
      - article [ref=e118]:
        - img "Koenigsegg Jesko" [ref=e120]
        - generic [ref=e122]:
          - generic [ref=e123]:
            - generic [ref=e124]: HW Exotics
            - generic [ref=e125]: "2024"
          - heading "Koenigsegg Jesko" [level=3] [ref=e126]
          - button "Acquire" [disabled] [ref=e128]:
            - img [ref=e129]
            - text: Acquire
      - article [ref=e130]:
        - img "Batmobile (The Batman)" [ref=e132]
        - generic [ref=e134]:
          - generic [ref=e135]:
            - generic [ref=e136]: Batman
            - generic [ref=e137]: "2024"
          - heading "Batmobile (The Batman)" [level=3] [ref=e138]
          - button "Acquire" [disabled] [ref=e140]:
            - img [ref=e141]
            - text: Acquire
      - article [ref=e142]:
        - img "U.S.S. Enterprise NCC-1701" [ref=e144]
        - generic [ref=e146]:
          - generic [ref=e147]:
            - generic [ref=e148]: HW Screen Time
            - generic [ref=e149]: "2024"
          - heading "U.S.S. Enterprise NCC-1701" [level=3] [ref=e150]
          - button "Acquire" [disabled] [ref=e152]:
            - img [ref=e153]
            - text: Acquire
      - article [ref=e154]:
        - img "Dodge Charger SRT" [ref=e156]
        - generic [ref=e158]:
          - generic [ref=e159]:
            - generic [ref=e160]: HW First Response
            - generic [ref=e161]: "2024"
          - heading "Dodge Charger SRT" [level=3] [ref=e162]
          - button "Acquire" [disabled] [ref=e164]:
            - img [ref=e165]
            - text: Acquire
      - article [ref=e166]:
        - img "'89 Mercedes-Benz 560 SEC AMG" [ref=e168]
        - generic [ref=e170]:
          - generic [ref=e171]:
            - generic [ref=e172]: HW Modified
            - generic [ref=e173]: "2024"
          - heading "'89 Mercedes-Benz 560 SEC AMG" [level=3] [ref=e174]
          - button "Acquire" [disabled] [ref=e176]:
            - img [ref=e177]
            - text: Acquire
      - article [ref=e178]:
        - img "Honda Civic EF" [ref=e180]
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e184]: HW J-Imports
            - generic [ref=e185]: "2024"
          - heading "Honda Civic EF" [level=3] [ref=e186]
          - button "Acquire" [disabled] [ref=e188]:
            - img [ref=e189]
            - text: Acquire
      - article [ref=e190]:
        - img "Toyota Van" [ref=e192]
        - generic [ref=e194]:
          - generic [ref=e195]:
            - generic [ref=e196]: HW J-Imports
            - generic [ref=e197]: "2024"
          - heading "Toyota Van" [level=3] [ref=e198]
          - button "Acquire" [disabled] [ref=e200]:
            - img [ref=e201]
            - text: Acquire
      - article [ref=e202]:
        - img "Nissan Skyline GT-R (R32)" [ref=e204]
        - generic [ref=e206]:
          - generic [ref=e207]:
            - generic [ref=e208]: HW J-Imports
            - generic [ref=e209]: "2023"
          - heading "Nissan Skyline GT-R (R32)" [level=3] [ref=e210]
          - button "Acquire" [disabled] [ref=e212]:
            - img [ref=e213]
            - text: Acquire
      - article [ref=e214]:
        - img "Mazda RX-7 FD" [ref=e216]
        - generic [ref=e218]:
          - generic [ref=e219]:
            - generic [ref=e220]: HW Drift
            - generic [ref=e221]: "2024"
          - heading "Mazda RX-7 FD" [level=3] [ref=e222]
          - button "Acquire" [disabled] [ref=e224]:
            - img [ref=e225]
            - text: Acquire
      - article [ref=e226]:
        - img "Lamborghini Sian FKP 37" [ref=e228]
        - generic [ref=e230]:
          - generic [ref=e231]:
            - generic [ref=e232]: HW Exotics
            - generic [ref=e233]: "2023"
          - heading "Lamborghini Sian FKP 37" [level=3] [ref=e234]
          - button "Acquire" [disabled] [ref=e236]:
            - img [ref=e237]
            - text: Acquire
      - article [ref=e238]:
        - img "Bugatti Bolide" [ref=e240]
        - generic [ref=e242]:
          - generic [ref=e243]:
            - generic [ref=e244]: HW Exotics
            - generic [ref=e245]: "2024"
          - heading "Bugatti Bolide" [level=3] [ref=e246]
          - button "Acquire" [disabled] [ref=e248]:
            - img [ref=e249]
            - text: Acquire
      - article [ref=e250]:
        - img "Lotus Evija" [ref=e252]
        - generic [ref=e254]:
          - generic [ref=e255]:
            - generic [ref=e256]: HW Green Speed
            - generic [ref=e257]: "2023"
          - heading "Lotus Evija" [level=3] [ref=e258]
          - button "Acquire" [disabled] [ref=e260]:
            - img [ref=e261]
            - text: Acquire
      - article [ref=e262]:
        - img "Shelby GT500" [ref=e264]
        - generic [ref=e266]:
          - generic [ref=e267]:
            - generic [ref=e268]: Muscle Mania
            - generic [ref=e269]: "2024"
          - heading "Shelby GT500" [level=3] [ref=e270]
          - button "Acquire" [disabled] [ref=e272]:
            - img [ref=e273]
            - text: Acquire
      - article [ref=e274]:
        - img "'67 Camaro" [ref=e276]
        - generic [ref=e278]:
          - generic [ref=e279]:
            - generic [ref=e280]: HW Art Cars
            - generic [ref=e281]: "2024"
          - heading "'67 Camaro" [level=3] [ref=e282]
          - button "Acquire" [disabled] [ref=e284]:
            - img [ref=e285]
            - text: Acquire
      - article [ref=e286]:
        - img "Monster High Ghoul Mobile" [ref=e288]
        - generic [ref=e290]:
          - generic [ref=e291]:
            - generic [ref=e292]: HW Screen Time
            - generic [ref=e293]: "2024"
          - heading "Monster High Ghoul Mobile" [level=3] [ref=e294]
          - button "Acquire" [disabled] [ref=e296]:
            - img [ref=e297]
            - text: Acquire
      - article [ref=e298]:
        - img "Grumobile" [ref=e300]
        - generic [ref=e302]:
          - generic [ref=e303]:
            - generic [ref=e304]: HW Screen Time
            - generic [ref=e305]: "2024"
          - heading "Grumobile" [level=3] [ref=e306]
          - button "Acquire" [disabled] [ref=e308]:
            - img [ref=e309]
            - text: Acquire
      - article [ref=e310]:
        - img "Pass 'n Go" [ref=e312]
        - generic [ref=e314]:
          - generic [ref=e315]:
            - generic [ref=e316]: Basic Line
            - generic [ref=e317]: "2025"
          - heading "Pass 'n Go" [level=3] [ref=e318]
          - button "Acquire" [disabled] [ref=e320]:
            - img [ref=e321]
            - text: Acquire
      - article [ref=e322]:
        - img "RD-06" [ref=e324]
        - generic [ref=e326]:
          - generic [ref=e327]:
            - generic [ref=e328]: Basic Line
            - generic [ref=e329]: "2025"
          - heading "RD-06" [level=3] [ref=e330]
          - button "Acquire" [disabled] [ref=e332]:
            - img [ref=e333]
            - text: Acquire
      - article [ref=e334]:
        - img "Cadillac Project GTP Hypercar" [ref=e336]
        - generic [ref=e338]:
          - generic [ref=e339]:
            - generic [ref=e340]: HW Turbo
            - generic [ref=e341]: "2024"
          - heading "Cadillac Project GTP Hypercar" [level=3] [ref=e342]
          - button "Acquire" [disabled] [ref=e344]:
            - img [ref=e345]
            - text: Acquire
      - article [ref=e346]:
        - img "Ford Maverick Custom" [ref=e348]
        - generic [ref=e350]:
          - generic [ref=e351]:
            - generic [ref=e352]: HW Hot Trucks
            - generic [ref=e353]: "2024"
          - heading "Ford Maverick Custom" [level=3] [ref=e354]
          - button "Acquire" [disabled] [ref=e356]:
            - img [ref=e357]
            - text: Acquire
      - article [ref=e358]:
        - img "Audi RS e-tron GT" [ref=e360]
        - generic [ref=e362]:
          - generic [ref=e363]:
            - generic [ref=e364]: Factory Fresh
            - generic [ref=e365]: "2024"
          - heading "Audi RS e-tron GT" [level=3] [ref=e366]
          - button "Acquire" [disabled] [ref=e368]:
            - img [ref=e369]
            - text: Acquire
      - article [ref=e370]:
        - img "'47 Chevy Fleetline" [ref=e372]
        - generic [ref=e374]:
          - generic [ref=e375]:
            - generic [ref=e376]: Treasure Hunt
            - generic [ref=e377]: "2024"
          - heading "'47 Chevy Fleetline" [level=3] [ref=e378]
          - button "Acquire" [disabled] [ref=e380]:
            - img [ref=e381]
            - text: Acquire
      - article [ref=e382]:
        - img "Lucid Air" [ref=e384]
        - generic [ref=e386]:
          - generic [ref=e387]:
            - generic [ref=e388]: HW Green Speed
            - generic [ref=e389]: "2024"
          - heading "Lucid Air" [level=3] [ref=e390]
          - button "Acquire" [disabled] [ref=e392]:
            - img [ref=e393]
            - text: Acquire
      - article [ref=e394]:
        - img "Rimac Nevera" [ref=e396]
        - generic [ref=e398]:
          - generic [ref=e399]:
            - generic [ref=e400]: HW Green Speed
            - generic [ref=e401]: "2024"
          - heading "Rimac Nevera" [level=3] [ref=e402]
          - button "Acquire" [disabled] [ref=e404]:
            - img [ref=e405]
            - text: Acquire
      - article [ref=e406]:
        - img "'90 Honda Civic EF" [ref=e408]
        - generic [ref=e410]:
          - generic [ref=e411]:
            - generic [ref=e412]: HW J-Imports
            - generic [ref=e413]: "2024"
          - heading "'90 Honda Civic EF" [level=3] [ref=e414]
          - button "Acquire" [disabled] [ref=e416]:
            - img [ref=e417]
            - text: Acquire
      - article [ref=e418]:
        - img "BMW M3 Wagon" [ref=e420]
        - generic [ref=e422]:
          - generic [ref=e423]:
            - generic [ref=e424]: Factory Fresh
            - generic [ref=e425]: "2024"
          - heading "BMW M3 Wagon" [level=3] [ref=e426]
          - button "Acquire" [disabled] [ref=e428]:
            - img [ref=e429]
            - text: Acquire
      - article [ref=e430]:
        - img "Pagani Utopia" [ref=e432]
        - generic [ref=e434]:
          - generic [ref=e435]:
            - generic [ref=e436]: HW Exotics
            - generic [ref=e437]: "2024"
          - heading "Pagani Utopia" [level=3] [ref=e438]
          - button "Acquire" [disabled] [ref=e440]:
            - img [ref=e441]
            - text: Acquire
      - article [ref=e442]:
        - img "Aston Martin Valkyrie" [ref=e444]
        - generic [ref=e446]:
          - generic [ref=e447]:
            - generic [ref=e448]: HW Exotics
            - generic [ref=e449]: "2024"
          - heading "Aston Martin Valkyrie" [level=3] [ref=e450]
          - button "Acquire" [disabled] [ref=e452]:
            - img [ref=e453]
            - text: Acquire
      - article [ref=e454]:
        - img "'73 Jeep J10" [ref=e456]
        - generic [ref=e458]:
          - generic [ref=e459]:
            - generic [ref=e460]: HW Hot Trucks
            - generic [ref=e461]: "2024"
          - heading "'73 Jeep J10" [level=3] [ref=e462]
          - button "Acquire" [disabled] [ref=e464]:
            - img [ref=e465]
            - text: Acquire
      - article [ref=e466]:
        - img "Hummer EV" [ref=e468]
        - generic [ref=e470]:
          - generic [ref=e471]:
            - generic [ref=e472]: HW Green Speed
            - generic [ref=e473]: "2024"
          - heading "Hummer EV" [level=3] [ref=e474]
          - button "Acquire" [disabled] [ref=e476]:
            - img [ref=e477]
            - text: Acquire
      - article [ref=e478]:
        - img "DeLorean Alpha5" [ref=e480]
        - generic [ref=e482]:
          - generic [ref=e483]:
            - generic [ref=e484]: HW Green Speed
            - generic [ref=e485]: "2024"
          - heading "DeLorean Alpha5" [level=3] [ref=e486]
          - button "Acquire" [disabled] [ref=e488]:
            - img [ref=e489]
            - text: Acquire
      - article [ref=e490]:
        - img "Mercedes-AMG GT" [ref=e492]
        - generic [ref=e494]:
          - generic [ref=e495]:
            - generic [ref=e496]: Factory Fresh
            - generic [ref=e497]: "2024"
          - heading "Mercedes-AMG GT" [level=3] [ref=e498]
          - button "Acquire" [disabled] [ref=e500]:
            - img [ref=e501]
            - text: Acquire
      - article [ref=e502]:
        - img "Volkswagen ID. Buzz" [ref=e504]
        - generic [ref=e506]:
          - generic [ref=e507]:
            - generic [ref=e508]: HW Green Speed
            - generic [ref=e509]: "2024"
          - heading "Volkswagen ID. Buzz" [level=3] [ref=e510]
          - button "Acquire" [disabled] [ref=e512]:
            - img [ref=e513]
            - text: Acquire
      - article [ref=e514]:
        - img "Alfa Romeo Giulia Sprint GTA" [ref=e516]
        - generic [ref=e518]:
          - generic [ref=e519]:
            - generic [ref=e520]: Factory Fresh
            - generic [ref=e521]: "2024"
          - heading "Alfa Romeo Giulia Sprint GTA" [level=3] [ref=e522]
          - button "Acquire" [disabled] [ref=e524]:
            - img [ref=e525]
            - text: Acquire
    - generic [ref=e526]:
      - generic [ref=e527]: Displaying 39 of 39 castings
      - paragraph [ref=e528]: Sign in to start acquiring new pieces
  - contentinfo [ref=e529]:
    - generic [ref=e530]:
      - generic [ref=e531]:
        - generic [ref=e532]: THE DIGITAL CURATOR
        - generic [ref=e533]: © 2024 THE DIGITAL CURATOR. PRECISION ENGINEERED.
      - generic [ref=e534]:
        - link "Terms of Service" [ref=e535]:
          - /url: "#"
        - link "Privacy Policy" [ref=e536]:
          - /url: "#"
        - link "Contact Support" [ref=e537]:
          - /url: "#"
        - link "Archive" [ref=e538]:
          - /url: "#"
      - generic [ref=e539]:
        - button [ref=e540]:
          - img [ref=e541]
        - button [ref=e547]:
          - img [ref=e548]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e556] [cursor=pointer]:
    - img [ref=e557]
  - alert [ref=e562]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Discover Page', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/DigiGarage/discover');
  6  |   });
  7  | 
  8  |   test('should display search and filter controls', async ({ page }) => {
  9  |     await expect(page.getByPlaceholder(/Search by casting or series/i)).toBeVisible();
  10 |     await expect(page.locator('select')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('search should filter results', async ({ page }) => {
  14 |     const searchInput = page.getByPlaceholder(/Search by casting or series/i);
  15 |     await searchInput.fill('Skyline');
  16 |     
  17 |     const cards = page.locator('article');
  18 |     // Wait for animation or filter
  19 |     await page.waitForTimeout(500);
  20 |     const count = await cards.count();
  21 |     for (let i = 0; i < count; i++) {
> 22 |       await expect(cards.nth(i)).toContainText(/Skyline/i);
     |                                  ^ Error: expect(locator).toContainText(expected) failed
  23 |     }
  24 |   });
  25 | });
  26 | 
```