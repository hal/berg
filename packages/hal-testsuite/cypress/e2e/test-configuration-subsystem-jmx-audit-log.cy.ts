import { xorBy } from "cypress/types/lodash"

describe('TESTS: Configuration => Subsystems => JMX => Audit Log', () => {
  let containerEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      containerEndpoint = result
    })
  })

  beforeEach(() => {
    cy.visit('?connect=' + containerEndpoint + '#jmx')
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Create Audit Log',() => {
    const configurationFormId = 'jmx-audit-log-form'
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'jmx', 'configuration', 'audit-log']
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (result.result.valid) {
        cy.task('execute:cli', {
          managementApi: containerEndpoint + '/management',
          operation: 'remove',
          value: ['subsystem', 'jmx', 'configuration', 'audit-log']
        })
      }
    })
    cy.get('#jmx-audit-log-item').click()
    cy.get('#' + configurationFormId + ' .btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'jmx', 'configuration', 'audit-log']
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
    })
  })

  it('Update Audit Log', () => {
    const configurationFormId = 'jmx-audit-log-form'
    const enabled = 'enabled'
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'jmx', 'configuration', 'audit-log']
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (!result.result.valid) {
        cy.task('execute:cli', {
          managementApi: containerEndpoint + '/management',
          operation: 'add',
          value: ['subsystem', 'jmx', 'configuration', 'audit-log']
        })
      }
    })
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'jmx', 'configuration', 'audit-log'],
      name: enabled
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.get('#jmx-audit-log-item').click()
      cy.flip(configurationFormId, enabled, value)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: containerEndpoint + '/management',
        operation: 'read-attribute',
        address: ['subsystem', 'jmx', 'configuration', 'audit-log'],
        name: enabled
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

  it('Delete Audit Log', () => {
    const configurationFormId = 'jmx-audit-log-form'
    const removeButton = '#' + configurationFormId + ' a.clickable[data-operation="remove"'
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'jmx', 'configuration', 'audit-log']
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      if (!result.result.valid) {
        cy.task('execute:cli', {
          managementApi: containerEndpoint + '/management',
          operation: 'add',
          value: ['subsystem', 'jmx', 'configuration', 'audit-log']
        })
      }
    })
    cy.get('#jmx-audit-log-item').click()
    cy.get(removeButton).click()
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'jmx', 'configuration', 'audit-log']
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.false
    })
  })

})