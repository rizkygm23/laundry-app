/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Authenticate as the default admin user.
       * Injects user data directly into localStorage.
       */
      loginAsAdmin(): Chainable<void>;
      /**
       * Clear localStorage and session state.
       */
      clearSession(): Chainable<void>;
      /**
       * Visit a page and automatically inject the admin session.
       */
      visitWithAuth(url: string): Chainable<void>;
    }
  }
}

// Custom Command: loginAsAdmin
Cypress.Commands.add("loginAsAdmin", () => {
  const adminUser = {
    id: "a0000000-0000-0000-0000-000000000001",
    email: "admin@laundryapp.com",
    name: "Administrator Laundry",
    username: "admin"
  };
  localStorage.setItem("auth_user", JSON.stringify(adminUser));
});

// Custom Command: visitWithAuth
Cypress.Commands.add("visitWithAuth", (url: string) => {
  cy.visit(url, {
    onBeforeLoad(win) {
      const adminUser = {
        id: "a0000000-0000-0000-0000-000000000001",
        email: "admin@laundryapp.com",
        name: "Administrator Laundry",
        username: "admin"
      };
      win.localStorage.setItem("auth_user", JSON.stringify(adminUser));
    }
  });
});

// Custom Command: clearSession
Cypress.Commands.add("clearSession", () => {
  localStorage.clear();
  cy.clearCookies();
  cy.clearLocalStorage();
});
