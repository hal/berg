describe('TESTS: Configuration => Subsystem => Batch => Thread Pool', () => {

  const configurationFormId = 'batch-thread-pool-form'

  const threadPools =  {
    create: {
      name: 'thread-pool-create',
      maxThreads: 2
    },
    edit: {
      name: 'thread-pool-edit',
      maxThreads: 2
    },
    remove: {
      name: 'thread-pool-remove',
      maxThreads: 2
    }
  }

  const threadFactoryEdit = 'thread-factory-edit'

  let managementEndpoint: (string | unknown)

  before(() => {
    cy.task('start:wildfly:container').then((result) => {
      managementEndpoint = result
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'thread-factory', threadFactoryEdit],
      })
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.edit.name],
        'max-threads': threadPools.edit.maxThreads
      })
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'add',
        address: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.remove.name],
        'max-threads': threadPools.remove.maxThreads
      })
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Create Thread Pool',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-pool-item').click()
    cy.get('#batch-thread-pool-table_wrapper button.btn.btn-default > span:contains("Add")').click()
    cy.get('input#batch-thread-pool-table-add-name-editing')
        .click()
        .type(threadPools.create.name)
        .should('have.value', threadPools.create.name)
        .trigger('change')
    cy.get('input#batch-thread-pool-table-add-max-threads-editing')
        .click()
        .type(threadPools.create.maxThreads.toString())
        .should('have.value', threadPools.create.maxThreads.toString())
        .trigger('change')
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Add")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.create.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.true
      })
    })


  it('Remove Thread Pool',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-pool-item').click()
    cy.get('table#batch-thread-pool-table td:contains("' + threadPools.remove.name + '")').click()
    cy.get('#batch-thread-pool-table_wrapper button.btn.btn-default > span:contains("Remove")').click()
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click()
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'validate-address',
      value: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.remove.name],
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result.valid).to.be.false
     })
  })

  it('Edit max-threads',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-pool-item').click()
    cy.get('table#batch-thread-pool-table td:contains("' + threadPools.edit.name + '")').click()
    cy.editForm(configurationFormId)
    cy.get('input#batch-thread-pool-form-max-threads-editing')
        .click()
        .clear()
        .type('5')
        .should('have.value', '5')
        .trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.edit.name],
      name: 'max-threads'
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result).to.be.equal(5)
    })
  })

  it('Edit thread-factory',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-pool-item').click()
    cy.get('table#batch-thread-pool-table td:contains("' + threadPools.edit.name + '")').click()
    cy.editForm(configurationFormId)
    cy.get('input#batch-thread-pool-form-thread-factory-editing')
        .click()
        .type(threadFactoryEdit)
        .should('have.value', threadFactoryEdit)
        .trigger('change')
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet', 'thread-pool', threadPools.edit.name],
      name: 'thread-factory'
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
      expect(result.result).to.be.equal(threadFactoryEdit)
    })
  })

  it('Reset Thread Pool',() => {
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-thread-pool-item').click()
    cy.get('table#batch-thread-pool-table td:contains("' + threadPools.edit.name + '")').click()
    cy.resetForm(configurationFormId, managementEndpoint + '/management', ['subsystem', 'batch-jberet', 'thread-pool', threadPools.edit.name])
  })

})