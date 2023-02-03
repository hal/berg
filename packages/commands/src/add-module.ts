class AddModuleCommand {
  private _name: string;
  private _resources: string[];
  private _dependencies: string[];

  constructor(builder: AddModuleCommandBuilder) {
    this._name = builder.name;
    this._dependencies = builder.dependencies;
    this._resources = builder.resources;
  }

  toCLICommand() {
    return (
      '"module add --name= ' +
      this._name +
      " --resources=" +
      this._resources.join(",") +
      " --dependencies=" +
      this._dependencies.join(",") +
      '"'
    );
  }
}

export class AddModuleCommandBuilder {
  name: string;
  resources: string[] = [];
  dependencies: string[] = [];

  withName(name: string): AddModuleCommandBuilder {
    this.name = name;
    return this;
  }

  withResource(resource: string): AddModuleCommandBuilder {
    this.resources.push(resource);
    return this;
  }

  withResources(resources: string[]): AddModuleCommandBuilder {
    this.resources = this.resources.concat(resources);
    return this;
  }

  withDependency(dependency: string): AddModuleCommandBuilder {
    this.dependencies.push(dependency);
    return this;
  }

  withDependencies(dependencies: string[]): AddModuleCommandBuilder {
    this.dependencies = this.dependencies.concat(dependencies);
    return this;
  }

  build(): AddModuleCommand {
    return new AddModuleCommand(this);
  }
}
