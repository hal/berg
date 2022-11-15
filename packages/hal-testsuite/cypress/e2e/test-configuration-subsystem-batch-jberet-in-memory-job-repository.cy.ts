describe('TESTS: Configuration => Subsystem => Batch => In Memory', () => {

  const inMemoryJobRepositories =  {
    create: {
      name: 'in-memory-job-repository-create'
    },
    remove: {
      name: 'in-memory-job-repository-remove'
    }
  }

  let managementEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Create In Memory Job Repository',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-in-memory-job-repo-item').click()
    cy.get('#batch-in-memory-job-repo-table_wrapper button.btn.btn-default > span:contains("Add")').click()
    cy.get('input#batch-in-memory-job-repo-table-add-name-editing')
        .click()
        .clear()
        .type(inMemoryJobRepositories.create.name)
        .should('have.value', inMemoryJobRepositories.create.name)
        .trigger('change')
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'batch-jberet', 'in-memory-job-repository', inMemoryJobRepositories.create.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
      })
    })


  it('Remove In Memory Job Repository',() => {
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'in-memory-job-repository', inMemoryJobRepositories.remove.name],
      })
      cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
      cy.get('#batch-in-memory-job-repo-item').click()
      cy.get('table#batch-in-memory-job-repo-table td:contains("' + inMemoryJobRepositories.remove.name + '")').click()
      cy.get('#batch-in-memory-job-repo-table_wrapper button.btn.btn-default > span:contains("Remove")').click()
      cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'validate-address',
        value: ['subsystem', 'batch-jberet', 'in-memory-job-repository', inMemoryJobRepositories.remove.name],
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.false
       })
  })

})