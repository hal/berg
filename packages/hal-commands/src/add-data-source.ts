export class AddDataSource {
  name: string;
  jndiName: string;
  connectionUrl: string;
  driverName: string;
  userName: string;
  passWord: string;

  constructor(builder: AddDataSourceBuilder) {
    this.name = builder.name;
    this.jndiName = builder.jndiName;
    this.connectionUrl = builder.connectionUrl;
    this.driverName = builder.driverName;
    this.userName = builder.userName;
    this.passWord = builder.passWord;
  }

  toCLICommand(): string {
    return (
      '"data-source add --name= ' +
      this.name +
      " --jndi-name=" +
      this.jndiName +
      " --connection-url=" +
      this.connectionUrl +
      " --driver-name=" +
      this.driverName +
      " --user-name=" +
      this.userName +
      " --password=" +
      this.passWord +
      '"'
    );
  }
}

export class AddDataSourceBuilder {
  name: string;
  jndiName: string;
  connectionUrl: string;
  driverName: string;
  userName: string;
  passWord: string;

  withName(name: string): AddDataSourceBuilder {
    this.name = name;
    return this;
  }

  withJndiName(jndiName: string): AddDataSourceBuilder {
    this.jndiName = jndiName;
    return this;
  }

  withConnectionUrl(connectionUrl: string): AddDataSourceBuilder {
    this.connectionUrl = connectionUrl;
    return this;
  }

  withDriverName(driver: string): AddDataSourceBuilder {
    this.driverName = driver;
    return this;
  }

  withUsername(username: string): AddDataSourceBuilder {
    this.userName = username;
    return this;
  }

  withPassword(password: string): AddDataSourceBuilder {
    this.passWord = password;
    return this;
  }

  build(): AddDataSource {
    return new AddDataSource(this);
  }
}
