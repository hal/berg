describe('TESTS: Configuration => Subsystem => Batch => JDBC', () => {

  const jdbcJobRepositories =  {
    create: {
      name: 'jdbc-job-repository-create',
      dataSource: 'ExampleDS'
    },
    remove: {
      name: 'jdbc-job-repository-remove',
      dataSource: 'ExampleDS'
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

  it('Create JDBC Job Repository',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-jdbc-job-repo-item').click()
    cy.get('#batch-jdbc-job-repo-table_wrapper button.btn.btn-default > span:contains("Add")').click()
    cy.get('input#batch-jdbc-job-repo-table-add-name-editing')
        .click()
        .clear()
        .type(jdbcJobRepositories.create.name)
        .should('have.value', jdbcJobRepositories.create.name)
        .trigger('change')
    cy.get('input#batch-jdbc-job-repo-table-add-data-source-editing')
        .click()
        .clear()
        .type(jdbcJobRepositories.create.dataSource)
        .should('have.value', jdbcJobRepositories.create.dataSource)
        .trigger('change')
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'batch-jberet', 'jdbc-job-repository', jdbcJobRepositories.create.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
      })
    })


  it('Remove JDBC Job Repository',() => {
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'jdbc-job-repository', jdbcJobRepositories.remove.name],
        'data-source': jdbcJobRepositories.remove.dataSource
      })
      cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
      cy.get('#batch-jdbc-job-repo-item').click()
      cy.get('table#batch-jdbc-job-repo-table td:contains("' + jdbcJobRepositories.remove.name + '")').click()
      cy.get('#batch-jdbc-job-repo-table_wrapper button.btn.btn-default > span:contains("Remove")').click()
      cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'validate-address',
        value: ['subsystem', 'batch-jberet', 'jdbc-job-repository', jdbcJobRepositories.remove.name],
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result.valid).to.be.false
       })
  })

})