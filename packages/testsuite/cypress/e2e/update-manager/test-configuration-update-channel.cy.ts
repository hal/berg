describe("TESTS: Update Manager => Channels", () => {
  let managementEndpoint: string;

  const address = ["update-manager", "channels"];
  const channelForm = "channel-form";

  const channels = {
    gav: {
      name: "gav-channel",
      repositories: "nexus-id-1,https://repository.jboss.org/nexus/content/groups/public/",
      manifest: "org.jboss.eap.channels:wfnew",
    },
    url: {
      name: "online-channel",
      repositories: "nexus-id-1,https://repository.jboss.org/nexus/content/groups/public/",
      manifest: "https://repository.jboss.org/nexus/content/groups/public/",
    },
    updateGav: {
      repositories: "maven-id-1,https://repo1.maven.org/maven2/",
      manifest: "org.jboss.eap.channels:wfupdated",
    },
    updateUrl: {
      repositories: "maven-id-1,https://repo1.maven.org/maven2/",
      manifest: "https://repo1.maven.org/maven2/",
    },
  };

  before(function () {
    cy.startWildflyContainer().then((result) => {
      managementEndpoint = result as string;
      cy.skipIfNot(cy.isEAP(managementEndpoint), this);
    });
  });

  after(() => {
    cy.task("stop:containers");
  });

  it("Add new channel with gav", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-channel-add").click();
    cy.text(channelForm, "name", channels.gav.name);
    cy.formInput(channelForm, "repositories")
      .clear()
      .type(channels.gav.repositories + "{enter}")
      .trigger("change");
    cy.text(channelForm, "manifestgav", channels.gav.manifest);
    cy.confirmAddResourceWizard();
    cy.get("#update-manager-channel > ul").contains(channels.gav.name);
  });

  it("Add new channel with url", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#update-manager-channel-add").click();
    cy.text(channelForm, "name", channels.url.name);
    cy.formInput(channelForm, "repositories")
      .clear()
      .type(channels.url.repositories + "{enter}")
      .trigger("change");
    cy.text(channelForm, "manifesturl", channels.url.manifest);
    cy.confirmAddResourceWizard();
    cy.get("#update-manager-channel > ul").contains(channels.url.name);
  });

  it("Check view button", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#" + channels.gav.name).click();
    cy.get("#" + channels.gav.name + ' > div > a.clickable.btn.btn-finder:contains("View")')
      .should("be.visible")
      .click();
    cy.get("#hal-root-container").get("h1").contains("Channel");
  });

  it("Update gav channel parameters", () => {
    cy.navigateToSpecificChannel(managementEndpoint, channels.gav.name);
    cy.editForm(channelForm);
    cy.formInput(channelForm, "repositories")
      .clear()
      .type(channels.updateGav.repositories + "{enter}")
      .trigger("change");
    cy.text(channelForm, "manifestgav", channels.updateGav.manifest);
    cy.saveForm(channelForm);
    cy.verifySuccess();
  });

  it("Update url channel parameters", () => {
    cy.navigateToSpecificChannel(managementEndpoint, channels.url.name);
    cy.editForm(channelForm);
    cy.get(".tm-tag-remove").click();
    cy.formInput(channelForm, "repositories")
      .type(channels.updateUrl.repositories + "{enter}")
      .trigger("change");
    cy.text(channelForm, "manifesturl", channels.updateUrl.manifest);
    cy.saveForm(channelForm);
    cy.verifySuccess();
  });

  it("Remove channel", () => {
    cy.navigateToUpdateManagerPage(managementEndpoint, address);
    cy.get("#" + channels.gav.name).click();
    cy.get("#" + channels.gav.name + " > div > button.btn.btn-finder.dropdown-toggle")
      .should("be.visible")
      .click();
    cy.get("#" + channels.gav.name + " > div > ul > li > a.clickable")
      .should("be.visible")
      .click();
    cy.get('div.modal-footer > button.btn.btn-hal.btn-primary:contains("Yes")').click();
    cy.verifySuccess();
    cy.get("#update-manager-channel > ul > #" + channels.gav.name).should("not.exist");
  });

  /**
   * Check whether there is some item that starts with 'JBoss EAP' text
   */
  const isJbossEapChannelPrinted = ($items: JQuery<HTMLElement>): boolean => {
    for (let i = 0; i < $items.length; i++) {
      const text = $items[i].innerText.trim();
      if (text.startsWith('JBoss EAP')) {
        return true;
      }
    }
    return false;
  };

  /**
   * Get channel versions from first revision on updates section
   *
   * Make sure that there is at least one channel that starts with "JBoss EAP"
   */
  it("Check channel version in installation manager", () => {
    // navigate to Updates section of web-console
    cy.navigateToUpdateManagerPage(managementEndpoint, ["update-manager", "updates"]);

    // click on last printed revision (first revision in history)
    cy.get('#update-manager-update ul li').last().click();

    // try to find EAP channel
    cy.contains('li.list-group-item', 'Channel Versions')
      .find('.value ul li')
      .should(($items) => {
        expect(isJbossEapChannelPrinted($items), '"JBoss EAP" channel not printed').to.equal(true);
      });
  });

  /**
   * Get channel versions from first revision on runtimes section
   *
   * Make sure that there is at least one channel that starts with "JBoss EAP"
   */
  it("Check channel version in runtimes", () => {
    cy.navigateTo(managementEndpoint, "runtime;path=standalone-server-column~standalone-host-server");
    cy.get('#standalone-server-column ul li').first().click();
    cy.get('#channel-versions li .value').should(($items) => {
      expect(isJbossEapChannelPrinted($items), '"JBoss EAP" channel not printed').to.equal(true);
    });
  });
});
