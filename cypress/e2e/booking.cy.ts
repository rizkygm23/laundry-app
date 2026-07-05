describe("Customer Booking E2E Tests", () => {
  beforeEach(() => {
    cy.clearSession();
  });

  it("should create a laundry booking successfully", () => {
    cy.visit("/");

    // Scroll to booking form
    cy.get("#booking-form").scrollIntoView();

    // Fill phone number first (trigger autocomplete check)
    cy.get("input#nomor_hp").type("081298765432"); // Budi Santoso's phone in seed data

    // Wait for the customer lookup to trigger and show toast
    cy.wait(1500);

    // Verify Name and Address auto-filled
    cy.get("input#nama").should("have.value", "Budi Santoso");
    cy.get("textarea#alamat").should("have.value", "Jl. Thamrin No. 5, Jakarta");

    // Open Service select dropdown
    cy.contains("Pilih Layanan").click();
    // Select the first service option from the dropdown popup
    cy.get('[role="option"]').first().click();

    // Change estimasi jumlah
    cy.get("input#jumlah").clear().type("6");

    // Click submit button
    cy.get('button[type="submit"]').contains("Pesan Penjemputan").click();

    // Verify success redirect
    cy.url().should("include", "/booking/success");
    cy.contains("Pemesanan Berhasil!").should("be.visible");
    cy.contains("Kode Pesanan Anda").should("be.visible");
  });
});
