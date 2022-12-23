package org.jboss.hal.cypress.resources;

import org.wildfly.extension.core.management.client.ProcessStateListener;
import org.wildfly.extension.core.management.client.ProcessStateListenerInitParameters;
import org.wildfly.extension.core.management.client.RunningStateChangeEvent;
import org.wildfly.extension.core.management.client.RuntimeConfigurationStateChangeEvent;

public class SimpleProcessStateListener implements ProcessStateListener
{
    private ProcessStateListenerInitParameters parameters;

    @Override
    public void init(ProcessStateListenerInitParameters parameters) {
        this.parameters = parameters;
    }

    @Override
    public void cleanup() {
    }

    @Override
    public void runtimeConfigurationStateChanged(RuntimeConfigurationStateChangeEvent evt) {
        System.out.printf("%s %s %s %s\n%n", parameters.getProcessType(), parameters.getRunningMode(), evt.getOldState(), evt.getNewState());
    }

    @Override
    public void runningStateChanged(RunningStateChangeEvent evt) {
        System.out.printf("%s %s %s %s\n", parameters.getProcessType(), parameters.getRunningMode(), evt.getOldState(), evt.getNewState());
    }
}
