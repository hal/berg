import maven from "maven";
import path from "path";

const fixturesDirectory = path.resolve(__dirname, "..", "..", "..", "packages", "testsuite", "cypress", "fixtures");

const jdbcDriversDirectory = path.resolve(fixturesDirectory, "jdbc-drivers");
const modulesDirectory = path.resolve(fixturesDirectory, "modules");

const mavenInstance = maven.create({
  cwd: path.resolve(__dirname, ".."),
  batchMode: true,
});
(async () => {
  await mavenInstance.execute(["clean", "install"], {
    "jdbc.drivers.copy.dependencies.output.directory": jdbcDriversDirectory,
    "modules.copy.dependencies.output.directory": modulesDirectory,
  });
})();