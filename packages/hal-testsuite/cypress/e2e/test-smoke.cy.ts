describe('TESTS: Homepage navigation', () => {

  let containerEndpoint: (string | unknown)
  
  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      containerEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  beforeEach(() => {
    cy.on('uncaught:exception', (err, runable) => {
      return false
    })
    cy.visit('?connect=' + containerEndpoint + '#home')
    cy.get('#hal-root-container').should('be.visible')
  })


  it('Should display About info', () => {
    cy.get('a.tool.clickable > span.pficon').click({force: true})
      .get('div.product-versions-pf').contains('Product Version').siblings('dd').should('include.text', '26.1.0.Final')
  })

  it('Should load Deployments page', () => {
    cy.get('#tlc-deployments').click()
    .get('#hal-finder-preview').should('be.visible')
    .url().should((url) => {
        expect(url).to.contain('#deployments')
    })
  })

  
  it('Should load Configuration page', () => {
    cy.get('#tlc-configuration').click()
    .get('#hal-finder-preview').should('be.visible')
    .url().should((url) => {
      expect(url).to.contain('#configuration')
  })
  })

  it('Should load Runtime page', () => {
    cy.get('#tlc-runtime').click()
    .get('#hal-finder-preview').should('be.visible')
    .url().should((url) => {
      expect(url).to.contain('#runtime')
  })
  })

  it('Should load Patching page', () => {
    cy.get('#tlc-patching').click()
    .get('#hal-finder-preview').should('be.visible')
    .url().should((url) => {
      expect(url).to.contain('#patching')
  })
  })

  it('Should load Access Control page', () => {
    cy.get('#tlc-access-control').click()
    .get('#hal-finder-preview').should('be.visible')
    .url().should((url) => {
      expect(url).to.contain('#access-control')
  })
  })
})