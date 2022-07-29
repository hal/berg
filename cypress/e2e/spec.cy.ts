describe('Smoke tests', () => {

  before(() => {
    cy.task('start:container')
  })

  it('Should display About info', () => {
    cy.visit('http://localhost:9990')
    cy.get('a.tool.clickable > span.pficon').click({force: true})
    cy.get('div.product-versions-pf').contains('Product Version').siblings('dd').should('include.text', '26.1.2.Final')
  })

  it('Should load Deployments page', () => {
    cy.visit('http://localhost:9990')
    cy.get('#tlc-deployments').click()
    cy.url().should((url) => {
        expect(url).to.contain('#deployments')
    })
  })

  it('Should load Configuration page', () => {
    cy.visit('http://localhost:9990')
    cy.get('#tlc-configuration').click()
    cy.url().should((url) => {
      expect(url).to.contain('#configuration')
  })
  })

  it('Should load Runtime page', () => {
    cy.visit('http://localhost:9990')
    cy.get('#tlc-runtime').click()
    cy.url().should((url) => {
      expect(url).to.contain('#runtime')
  })
  })

  it('Should load Paching page', () => {
    cy.visit('http://localhost:9990')
    cy.get('#tlc-patching').click()
    cy.url().should((url) => {
      expect(url).to.contain('#patching')
  })
  })

  it('Should load Access Control page', () => {
    cy.visit('http://localhost:9990')
    cy.get('#tlc-access-control').click()
    cy.url().should((url) => {
      expect(url).to.contain('#access-control')
  })
  })
})