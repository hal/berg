describe('Smoke tests', () => {

  beforeEach(() => {
    cy.visit('/')
  })


  it('Should display About info', () => {
    cy.get('a.tool.clickable > span.pficon').click({force: true})
    cy.get('div.product-versions-pf').contains('Product Version').siblings('dd').should('include.text', '26.1.0.Final')
  })

  it('Should load Deployments page', () => {
    cy.get('#tlc-deployments').click()
    cy.url().should((url) => {
        expect(url).to.contain('#deployments')
    })
  })

  it('Should load Configuration page', () => {
    cy.get('#tlc-configuration').click()
    cy.url().should((url) => {
      expect(url).to.contain('#configuration')
  })
  })

  it('Should load Runtime page', () => {
    cy.get('#tlc-runtime').click()
    cy.url().should((url) => {
      expect(url).to.contain('#runtime')
  })
  })

  it('Should load Paching page', () => {
    cy.get('#tlc-patching').click()
    cy.url().should((url) => {
      expect(url).to.contain('#patching')
  })
  })

  it('Should load Access Control page', () => {
    cy.get('#tlc-access-control').click()
    cy.url().should((url) => {
      expect(url).to.contain('#access-control')
  })
  })
})