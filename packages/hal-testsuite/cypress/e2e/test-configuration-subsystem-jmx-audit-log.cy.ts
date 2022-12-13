describe('TESTS: Configuration => Subsystem => JMX => Audit Log', () => {
  let managementEndpoint: (string | unknown)
  const configurationFormId = 'jmx-audit-log-form'
  const emptyConfigurationForm = 'jmx-audit-log-form-empty'
  const address = ['subsystem', 'jmx', 'configuration', 'audit-log']
  const enabled = 'enabled'

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Create Audit Log',() => {
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (result.result.valid) {
        cy.task('execute:cli', {
          managementApi: managementEndpoint + '/management',
          operation: 'remove',
          address: address
        })
      }
    })
    cy.navigateTo(managementEndpoint, 'jmx')
    cy.get('#jmx-audit-log-item').click()
    cy.get('#' + emptyConfigurationForm + ' .btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
    })
  })

  it('Toggle enabled', () => {
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (!result.result.valid) {
        cy.task('execute:cli', {
          managementApi: managementEndpoint + '/management',
          operation: 'add',
          address: address
        })
      }
    })
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: address,
      name: enabled
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateTo(managementEndpoint, 'jmx')
      cy.get('#jmx-audit-log-item').click()
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, enabled, value)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: address,
        name: enabled
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

  it('Delete Audit Log', () => {
    const removeButton = '#' + configurationFormId + ' a.clickable[data-operation="remove"'
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (!result.result.valid) {
        cy.task('execute:cli', {
          managementApi: managementEndpoint + '/management',
          operation: 'add',
          address: address
        })
      }
    })
    cy.navigateTo(managementEndpoint, 'jmx')
    cy.get('#jmx-audit-log-item').click()
    cy.get(removeButton).click()
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.false
    })
  })

  it('Reset Audit Log', () => {
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: address
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (!result.result.valid) {
        cy.task('execute:cli', {
          managementApi: managementEndpoint + '/management',
          operation: 'add',
          address: address
        }).then((result:any) => {
          expect(result.outcome).to.equal('success')
        })
      }
    })
    cy.navigateTo(managementEndpoint, 'jmx')
    cy.get('#jmx-audit-log-item').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', address)
  })

})