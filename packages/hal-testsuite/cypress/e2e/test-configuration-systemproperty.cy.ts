describe('TESTS: Configuration => System Properties', () => {

    beforeEach(() => {
      cy.visit('#system-properties')
    })
  
  
    it('create', () => {
      cy.get('a.tool.clickable > span.pficon').click({force: true})
      cy.get('div.product-versions-pf').contains('Product Version').siblings('dd').should('include.text', '26.1.0.Final')
    })
  
    it('read', () => {
      cy.get('#tlc-deployments').click()
      cy.url().should((url) => {
          expect(url).to.contain('#deployments')
      })
    })
  
    it('update', () => {
      cy.get('#tlc-configuration').click()
      cy.url().should((url) => {
        expect(url).to.contain('#configuration')
    })
    })
  
    it('delete', () => {
      cy.get('#tlc-runtime').click()
      cy.url().should((url) => {
        expect(url).to.contain('#runtime')
    })
    })
  })