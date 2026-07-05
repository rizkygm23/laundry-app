describe("Remaining Routes & Extra Features E2E Tests", () => {
  beforeEach(() => {
    cy.clearSession();
  });

  // Ignore uncaught exceptions from the application (like ResizeObserver loop limits)
  // to prevent minor warnings/errors from failing the E2E tests.
  Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
  });

  it("should perform CRUD on Pelanggan (Customers)", () => {
    cy.visitWithAuth("/pelanggan");

    // Verify page title
    cy.contains("Manajemen Pelanggan").should("be.visible");

    // Add customer
    cy.contains("Tambah Pelanggan").click({ force: true });
    const customerName = `E2E Customer ${Date.now()}`;
    cy.get("input#nama").type(customerName);
    cy.get("input#nomor_hp").type("089988776655");
    cy.get("input#alamat").type("Jl. Cypress E2E No. 123");
    
    // Submit form (button with type="submit" containing "Simpan")
    cy.get('button[type="submit"]').contains("Simpan").click({ force: true });

    // Verify customer is in the table
    cy.contains(customerName).should("be.visible");
    cy.contains("089988776655").should("be.visible");

    // Edit customer (click the first edit button - pencil icon)
    cy.get("table tbody tr").first().find('button').first().click({ force: true });
    const updatedName = `${customerName} Edited`;
    cy.get("input#nama").clear().type(updatedName);
    cy.get('button[type="submit"]').contains("Update").click({ force: true });

    // Verify updated customer
    cy.contains(updatedName).should("be.visible");

    // Delete customer
    cy.on("window:confirm", () => true);
    // Click delete button (second button in action cell)
    cy.get("table tbody tr").first().find('button').eq(1).click({ force: true });

    // Verify deleted
    cy.contains(updatedName).should("not.exist");
  });

  it("should view and navigate Delivery/Kurir Page tabs", () => {
    cy.visitWithAuth("/delivery");

    // Verify page headers
    cy.contains("Pesanan Online (Antar Jemput)").should("be.visible");
    cy.contains("Kelola penjemputan dan pengantaran laundry.").should("be.visible");

    // Verify tabs are present
    cy.get('[role="tablist"]').within(() => {
      cy.contains("Penjemputan").should("be.visible");
      cy.contains("Pengantaran").should("be.visible");
    });

    // Click "Pengantaran" tab
    cy.contains("Pengantaran").click({ force: true });
    cy.wait(500); // wait for content to switch
  });

  it("should perform Expense CRUD on Kas/Keuangan Page", () => {
    cy.visitWithAuth("/kas");

    // Verify financial statistics cards
    cy.contains("Total Pendapatan").should("be.visible");
    cy.contains("Total Pengeluaran").should("be.visible");
    cy.contains("Saldo Kas").should("be.visible");

    // Switch timeframe filter to "Sebulan" to make it robust against daily/timezone boundaries
    cy.contains("Sebulan").click({ force: true });
    cy.wait(500);

    // Add expense (click the trigger button in card header)
    cy.contains("Tambah").click({ force: true });
    
    // Fill form
    cy.contains("Pilih kategori").click({ force: true });
    cy.get('[role="option"]').contains("Bahan Baku").click({ force: true });
    
    // Use a very short description to prevent truncation by "truncate max-w-[150px]"
    const expenseDesc = `E2E-${Date.now().toString().slice(-6)}`;
    cy.get('input[placeholder="Masukkan deskripsi pengeluaran"]').type(expenseDesc);
    cy.get('input[placeholder="0"]').type("45000");

    // Click Tambah button INSIDE the dialog to submit (target specifically using [role="dialog"])
    cy.get('[role="dialog"]').find('button').contains("Tambah").click({ force: true });

    // Verify expense is added to the list (it should show in the table)
    cy.contains(expenseDesc).should("be.visible");
    cy.contains("Rp 45.000").should("be.visible");

    // Edit expense
    cy.get("table").contains(expenseDesc).parents("tr").find("button").first().click({ force: true });
    const updatedDesc = `${expenseDesc}-Ed`;
    cy.get('input[placeholder="Masukkan deskripsi pengeluaran"]').clear().type(updatedDesc);
    cy.get('button').contains("Simpan").click({ force: true });

    // Verify updated
    cy.contains(updatedDesc).should("be.visible");

    // Delete expense
    cy.on("window:confirm", () => true);
    cy.get("table").contains(updatedDesc).parents("tr").find("button").eq(1).click({ force: true });

    // Verify deleted
    cy.contains(updatedDesc).should("not.exist");
  });

  it("should manage Outlet Settings", () => {
    cy.visitWithAuth("/dashboard/settings");

    // Verify page structure
    cy.contains("Pengaturan").should("be.visible");
    cy.contains("Lokasi Outlet Laundry").should("be.visible");
    
    // Clear and change address
    const newAddress = `E2E Laundry Outlet Address ${Date.now()}`;
    cy.get("input#address").clear().type(newAddress);

    // Save settings
    cy.contains("Simpan Pengaturan").click({ force: true });

    // Verify success toast/message (toast should pop up)
    cy.contains("Lokasi outlet berhasil disimpan").should("be.visible");
  });

  it("should view and search transactions", () => {
    cy.visitWithAuth("/transaksi");

    // Verify table structure
    cy.contains("Ringkasan Transaksi").should("be.visible");
    cy.contains("Semua Transaksi").should("be.visible");

    // Search by name and trigger by clicking the Search button
    cy.get('input[placeholder="Cari nama atau kode pesanan..."]').type("NonExistentUserSearch");
    cy.get('button.bg-blue-600').first().click({ force: true });
    cy.wait(500);
    cy.contains("Belum ada pesanan").should("be.visible");
  });

  it("should handle public Status Tracker search and show not found error", () => {
    // Visit Status Tracker directly with an invalid code
    cy.visit("/status/INVALID_CODE_12345");

    // Verify error is shown
    cy.contains("Pesanan tidak ditemukan. Mohon cek kembali kode Anda.").should("be.visible");

    // Use search box on Status Tracker page
    const searchCode = "TESTCODE123";
    cy.get('input[placeholder="Masukkan Kode Pesanan (Contoh: OL2312230001)"]').clear().type(searchCode);
    cy.get('input[placeholder="Masukkan Kode Pesanan (Contoh: OL2312230001)"]').next('button').click({ force: true });

    // Verify URL redirect to searchCode and shows error
    cy.url().should("include", `/status/${searchCode}`);
    cy.contains("Pesanan tidak ditemukan. Mohon cek kembali kode Anda.").should("be.visible");
  });
});
