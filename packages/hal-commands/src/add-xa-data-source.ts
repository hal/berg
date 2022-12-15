export class AddXADataSource {
  name: string;
  jndiName: string;
  driverName: string;
  xaDataSourceClass: string;
  xaDataSourceProperties: Map<string, string>;
  userName: string;
  passWord: string;

  constructor(builder: AddXADataSourceBuilder) {
    this.name = builder.name;
    this.jndiName = builder.jndiName;
    this.xaDataSourceClass = builder.xaDataSourceClass;
    this.xaDataSourceProperties = builder.xaDataSourceProperties;
    this.driverName = builder.driverName;
    this.userName = builder.userName;
    this.passWord = builder.passWord;
  }

  toCLICommand(): string {
    Array.from(this.xaDataSourceProperties.entries())
      .map(([key, value]) => {
        return "{" + key + "=" + value + "}";
      })
      .join(",");
    return (
      '"xa-data-source add --name= ' +
      this.name +
      " --jndi-name=" +
      this.jndiName +
      " --driver-name=" +
      this.driverName +
      " --xa-datasource-class=" +
      this.xaDataSourceClass +
      " --xa-datasource-properties={" +
      Array.from(this.xaDataSourceProperties)
        .map(([key, value]) => {
          return key + "=>" + value;
        })
        .join(",") +
      "}" +
      " --user-name=" +
      this.userName +
      " --password=" +
      this.passWord +
      '"'
    );
  }
}

export class AddXADataSourceBuilder {
  name: string;
  jndiName: string;
  xaDataSourceClass: string;
  xaDataSourceProperties: Map<string, string> = new Map<string, string>();
  driverName: string;
  userName: string;
  passWord: string;

  withName(name: string): AddXADataSourceBuilder {
    this.name = name;
    return this;
  }

  withJndiName(jndiName: string): AddXADataSourceBuilder {
    this.jndiName = jndiName;
    return this;
  }

  withDriverName(driver: string): AddXADataSourceBuilder {
    this.driverName = driver;
    return this;
  }

  withXaDataSourceClass(xaDataSourceClass: string): AddXADataSourceBuilder {
    this.xaDataSourceClass = xaDataSourceClass;
    return this;
  }

  withXaDataSourceProperty(key: string, value: string): AddXADataSourceBuilder {
    this.xaDataSourceProperties.set(key, value);
    return this;
  }

  withUsername(username: string): AddXADataSourceBuilder {
    this.userName = username;
    return this;
  }

  withPassword(password: string): AddXADataSourceBuilder {
    this.passWord = password;
    return this;
  }

  build(): AddXADataSource {
    return new AddXADataSource(this);
  }
}
