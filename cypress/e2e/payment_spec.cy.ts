const { v4: uuidv4 } = require("uuid");

describe("empty spec", () => {
  it("user can make payment", () => {
    //* login
    cy.visit("http://localhost:3000/signin");
    cy.findByRole("textbox", { name: /username/i }).type("johndoe");
    cy.findByLabelText(/password/i).type("s3cret");
    cy.findByRole("checkbox", { name: /remember me/i }).check();
    cy.findByRole("button", { name: /sign in/i }).click();

    //* check balance
    let oldBalance;
    cy.get('[data-test="sidenav-user-balance"]').then(($balance) => {
      oldBalance = parseFloat($balance.text().replace(/\$|,/g, ""));
    });

    //* Goto new payment page
    cy.findByRole("button", { name: /new/i }).click();

    //* search and select a contact to pay
    cy.findByRole("textbox").type("Ibrahim Dickens");
    cy.findByText(/ibrahim dickens/i).click();

    //* enter amount and note and click pay
    const note = uuidv4();
    const paymentAmount = "5.00";
    cy.findByPlaceholderText(/amount/i).type(paymentAmount);
    cy.findByPlaceholderText(/add a note/i).type(note);
    cy.findByRole("button", { name: /pay/i }).click();

    //* return to transactions
    cy.findByRole("button", { name: /return to transactions/i }).click();

    //* goto personal payments
    cy.findByRole("tab", { name: /mine/i }).click();

    //* click on payment
    cy.findByText(note).click({ force: true });

    //* verify if pamyent was made
    cy.findByText(`-$${paymentAmount}`).should("be.visible");
    cy.findByText(note).should("be.visible");

    //* vereify is payment amount was deducted
    cy.get('[data-test="sidenav-user-balance"]').then(($balance) => {
      const newBalance = parseFloat($balance.text().replace(/\$|,/g, ""));
      expect(oldBalance - parseFloat(paymentAmount)).to.equal(newBalance);
    });
  });
});
