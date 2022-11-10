import { xorBy } from "cypress/types/lodash"

describe('TESTS: Configuration => Subsystems => JMX => Configuration', () => {
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

  it('Toggle non-core-mbean-sensitivity',() => {
    const configurationFormId = 'jmx-configuration-form'
    const nonCoreMbeanSensitivity = 'non-core-mbean-sensitivity'
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: containerEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'jmx'],
      name: nonCoreMbeanSensitivity
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.get('#jmx-configuration-item').click()
      cy.flip(configurationFormId, nonCoreMbeanSensitivity, value)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: containerEndpoint + '/management',
        operation: 'read-attribute',
        address: ['subsystem', 'jmx'],
        name: nonCoreMbeanSensitivity
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

})