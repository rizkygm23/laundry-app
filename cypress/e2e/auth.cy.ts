describe("Authentication E2E Tests", () => {
  beforeEach(() => {
    cy.clearSession();
  });

  it("should show error on login with invalid credentials", () => {
    cy.visit("/login");
    cy.get("input#email").type("wrong@email.com");
    cy.get("input#password").type("wrongpassword");
    cy.get('button[type="submit"]').click();

    // Verify error toast
    cy.contains("Login gagal").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should login successfully with valid admin credentials", () => {
    cy.visit("/login");
    cy.get("input#email").type("admin@laundryapp.com");
    cy.get("input#password").type("admin123");
    cy.get('button[type="submit"]').click();

    // Verify redirect to dashboard and success toast
    cy.contains("Login berhasil").should("be.visible");
    cy.url().should("include", "/dashboard");
    cy.contains("Operasional Pesanan").should("be.visible");
  });

  it("should register a new user successfully, auto-login and navigate to dashboard", () => {
    const randomEmail = `testuser_${Date.now()}@laundry.com`;

    cy.visit("/register");
    cy.get("input#name").type("E2E Test User");
    cy.get("input#email").type(randomEmail);
    cy.get("input#password").type("password123");
    cy.get("input#confirmPassword").type("password123");
    cy.get('button[type="submit"]').click();

    // Verify redirect to dashboard and success toast
    cy.contains("Registrasi berhasil").should("be.visible");
    cy.url().should("include", "/dashboard");
    cy.contains("Operasional Pesanan").should("be.visible");
  });

  it("should logout successfully and redirect to login page", () => {
    cy.loginAsAdmin();
    cy.visit("/dashboard");

    // Click profile/avatar button in sidebar (desktop view) to open dropdown
    cy.get("aside").find("button").click();
    cy.contains("Logout").click();

    // Verify redirect to login page
    cy.url().should("include", "/login");
    cy.contains("Masuk ke akun Anda").should("be.visible");
  });
});

