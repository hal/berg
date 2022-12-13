describe('TESTS: Configuration => Interface', () => {

  const configurationFormId = 'interface-form'


  const interfaceToEdit = {
    name: 'interface-to-edit',
    inetAddress: 'localhost'
  }

  const address = ['interface', interfaceToEdit.name]

  const anyAddress = 'any-address'
  const inetAddress = 'inet-address'

  let managementEndpoint: (string | any)

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
          cy.task('execute:cli', {
            managementApi: result + '/management',
            operation: "add",
            address: address,
            'inet-address' : interfaceToEdit.inetAddress
          }).then((result: any) => {
            expect(result.outcome).to.equal('success')
          })
      })
  })

  
  after(() => {
    cy.task('stop:containers')
  })

  it('Toggle any-address', () => {
    let value: boolean
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: anyAddress
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateTo(managementEndpoint, 'interface;name=' + interfaceToEdit.name)
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, anyAddress, value)
      cy.clearAttribute(configurationFormId,inetAddress)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: address,
        name: anyAddress
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

  it('Reset', () => {
    cy.navigateTo(managementEndpoint, 'interface;name=' + interfaceToEdit.name)
    cy.resetForm(configurationFormId, managementEndpoint + '/management', address)
  })

})