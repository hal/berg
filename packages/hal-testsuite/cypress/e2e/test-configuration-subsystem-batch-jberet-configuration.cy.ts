describe('TESTS: Configuration => Subsystem => Batch => Configuration', () => {
  const configurationFormId = 'batch-configuration-form'
  const restartJobsOnResume = 'restart-jobs-on-resume'
  const defaultJobRepository = 'default-job-repository'
  let managementEndpoint: (string | unknown)

  before(() => {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result
    })
  })

  after(() => {
    cy.task('stop:containers')
  })

  it('Toggle restart-jobs-on-resume',() => {
    let value: boolean = false
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet'],
      name: restartJobsOnResume
    }).then((result: any) => {
      cy.log(result)
      value = result.result
      cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
      cy.get('#batch-configuration-item').click()
      cy.editForm(configurationFormId)
      cy.flip(configurationFormId, restartJobsOnResume, value)
      cy.saveForm(configurationFormId)
      cy.verifySuccess()
      cy.task('execute:cli', {
        managementApi: managementEndpoint + '/management',
        operation: 'read-attribute',
        address: ['subsystem', 'batch-jberet'],
        name: restartJobsOnResume
      }).then((result: any) => {
        cy.log(result)
        expect(result.outcome).to.equal('success')
        expect(result.result).to.equal(!value)
      })
      })
  })

  it('Edit default-job-repository', () => {
    let jobRepository: string = 'some-other-value'
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'add',
      address: ['subsystem', 'batch-jberet', 'in-memory-job-repository', jobRepository],
    }).then((result: any) => {
      expect(result.outcome).to.equal('success')
    })
    cy.navigateTo(managementEndpoint, 'batch-jberet-configuration')
    cy.get('#batch-configuration-item').click()
    cy.editForm(configurationFormId)
    cy.text(configurationFormId, defaultJobRepository, jobRepository)
    cy.saveForm(configurationFormId)
    cy.verifySuccess()
    cy.task('execute:cli', {
      managementApi: managementEndpoint + '/management',
      operation: 'read-attribute',
      address: ['subsystem', 'batch-jberet'],
      name: 'default-job-repository'
    }).then((result: any) => {
      cy.log(result)
      expect(result.outcome).to.equal('success')
      expect(result.result).to.equal(jobRepository)
    })
  })

})