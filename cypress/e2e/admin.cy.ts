describe("Admin Dashboard & Operations E2E Tests", () => {
  beforeEach(() => {
    cy.clearSession();
  });

  it("should perform CRUD on Layanan (Services)", () => {
    cy.visitWithAuth("/layanan");

    // Click "Tambah Layanan" button
    cy.contains("Tambah Layanan").click();

    // Fill form
    const serviceName = `E2E Service ${Date.now()}`;
    cy.get("input#nama").type(serviceName);
    cy.get("input#harga").type("12500");
    cy.get("input#durasi").clear().type("36");

    // Click Save
    cy.get('button[type="submit"]').contains("Simpan").click();

    // Verify it is added to the table
    cy.contains(serviceName).should("be.visible");
    cy.contains("Rp 12.500").should("be.visible");

    // Click Edit button for the created service (first edit button in the table)
    cy.get("table tbody tr").first().find('button').first().click();

    // Edit price
    cy.get("input#harga").clear().type("15000");

    // Click Update
    cy.get('button[type="submit"]').contains("Update").click();

    // Verify updated price in table
    cy.contains(serviceName).should("be.visible");
    cy.contains("Rp 15.000").should("be.visible");

    // Handle delete with window.confirm dialog mock
    cy.on("window:confirm", () => true);

    // Click Delete button for the created service (second button in action div)
    cy.get("table tbody tr").first().find('button').eq(1).click();

    // Verify service is removed
    cy.contains(serviceName).should("not.exist");
  });

  it("should create a new transaction successfully", () => {
    cy.visitWithAuth("/transaksi/create");

    // Fill customer WA (Budi Santoso from seed)
    cy.get("input#nomor_hp").type("081298765432");

    // Wait for auto-fill to lookup customer
    cy.wait(1500);

    // Verify auto-filled name
    cy.get("input#nama_pelanggan").should("have.value", "Budi Santoso");

    // Select the first service
    cy.contains("Pilih layanan...").click();
    cy.get('[role="option"]').first().click();

    // Input quantity (the number input in the item row)
    cy.get('input[type="number"]').first().clear().type("4");

    // Open Payment Modal or click submit
    // Let's check the submit button text:
    // It's usually "Buat Pesanan" or "Simpan Transaksi"
    // Let's locate and click the submit button
    cy.get('button').contains("Buat Pesanan").click();

    // If PaymentModal pops up (since bayarLangsung is checked/clicked, or if it redirects directly)
    // Let's check how the creation ends. It redirects to /struk/[kode]
    cy.url().should("include", "/struk/");
    cy.contains("NECIS LAUNDRY").should("be.visible");
    cy.contains("Budi Santoso").should("be.visible");
  });
});
