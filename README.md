# MyCambrian Playwright Automation Project (POM Framework)

## Overview
This project is an automated testing framework built using **Playwright** with the **Page Object Model (POM)** design pattern.  
The automation suite tests the core student features of the **MyCambrian** web portal, including:

- Login  
- Moodle navigation  
- Dashboard verification  
- Grade Report access  
- Student ID card print page  

The project follows clean coding standards and real-world automation best practices.

---

## Team Members
- Lizza Martinez - A00325183   
- Anthony Mbanu - A00322175  

---

## Project Structure (POM)

```
playwright-automation/
│
├── tests/                    # All test files
│   ├── dashboard.spec.ts
│   ├── login.spec.ts
│   ├── gradeReport.spec.ts
│   ├── moodleNavigation.spec.ts
│   ├── studentId.spec.ts
│   └── example.spec.ts
│
├── pages/                    # Page Object classes
│   ├── login.ts
│   ├── moodle.ts
│   ├── gradeReport.ts
│   ├── studentId.ts
│
├── utils/                    # Helpers (if needed)
│
├── playwright.config.ts      # Playwright configuration
├── package.json              # Project dependencies
└── README.md
```

---

## Features Automated

### 1. **Login Flow**
- Uses environment variables (`MYCAMBRIAN_USERNAME`, `MYCAMBRIAN_PASSWORD`)
- Validates successful login based on UI indicators

### 2. **Moodle Navigation**
- Navigates from MyCambrian → Moodle (opens in new tab)
- Verifies correct Moodle URL loads

### 3. **Dashboard Validation**
- Opens Moodle dashboard page
- Verifies Dashboard header and Timeline widget

### 4. **Grade Report**
- Navigates to Grade Report page
- Submits the form
- Validates the returned grade report message

### 5. **Student ID Print Page**
- Opens Student menu → Print Barcode page
- Verifies `div.cc-card` element is displayed

---

## Installation and Setup

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Install dotenv Package
The project uses `dotenv` to load environment variables from the `.env` file:
```bash
npm install dotenv
```

### 3️⃣ Install Playwright Browsers
```bash
npx playwright install
```

### 4️⃣ Create `.env` File  
Inside **tests/** create a file named `.env` with your credentials:

```env
MYCAMBRIAN_USERNAME=yourUsername
MYCAMBRIAN_PASSWORD=yourPassword
```

>  *Never commit real credentials to GitHub.*

### 5️⃣ Configuration
The `playwright.config.ts` file is configured to automatically load environment variables from `tests/.env`:

```typescript
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, 'tests/.env') });
```

---

## Running Tests

### Run all tests:
```bash
npx playwright test
```

### Run a specific test (e.g., login):
```bash
npx playwright test tests/login.spec.ts
```

### Run tests in headed mode (see the browser):
```bash
npx playwright test --headed
```

### Run a specific test in headed mode:
```bash
npx playwright test tests/login.spec.ts --headed
```

### Run with UI mode (interactive):
```bash
npx playwright test --ui
```

### View the last test report:
```bash
npx playwright show-report
```

---

## Testing Best Practices

### AAA Pattern (Arrange-Act-Assert)
All tests in this project follow the **AAA pattern**, a widely-used testing structure:

1. **Arrange** - Set up the test conditions
   - Load credentials from environment variables
   - Navigate to the target page
   - Initialize page objects
   - Wait for elements to be ready

2. **Act** - Perform the action being tested
   - Enter username and password
   - Click the login button
   - Navigate to a specific page
   - Submit a form

3. **Assert** - Verify the expected outcome
   - Check if login was successful
   - Verify correct page loaded
   - Confirm elements are visible
   - Validate expected content appears

**Example from login.spec.ts:**
```typescript
// ARRANGE - Set up test
const username = process.env.MYCAMBRIAN_USERNAME;
const password = process.env.MYCAMBRIAN_PASSWORD;
await page.goto(targetUrl);
const loginPage = new LoginPage(page);

// ACT - Perform login
await loginPage.enterUsername(username);
await loginPage.enterPassword(password);
await loginPage.clickLoginButton();

// ASSERT - Verify success
await expect(successBanner).toBeVisible();
```

This pattern makes tests easy to read, maintain, and debug.

---

## Technologies Used
- **Playwright** (JavaScript/TypeScript)
- **Page Object Model (POM)**
- **AAA Testing Pattern** (Arrange-Act-Assert)
- **Node.js**
- **dotenv** (Environment variables)

---

## License
This project is created for academic purposes and not affiliated with Cambrian College.

---

## Summary
This framework demonstrates professional-level automation using Playwright with POM, covering multiple user flows on the MyCambrian web portal. The project follows best practices including:

- **Page Object Model (POM)** - Organized code with reusable page classes
- **AAA Testing Pattern** - All tests follow Arrange-Act-Assert structure for clarity
- **Environment Variables** - Secure credential management using dotenv
- **Structured Tests** - Clean, maintainable test organization