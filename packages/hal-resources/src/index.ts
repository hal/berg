import maven from "maven";
import path from "path";

const fixturesDirectory = path.resolve(
  __dirname,
  "..",
  "..",
  "hal-testsuite",
  "cypress",
  "fixtures"
);

const jdbcDriversDirectory = path.resolve(fixturesDirectory, "jdbc-drivers");

const mavenInstance = maven.create({
  cwd: path.resolve(__dirname, ".."),
});
(async () => {
  await mavenInstance.execute(["dependency:copy-dependencies"], {
    excludeTransitive: "true",
    outputDirectory: jdbcDriversDirectory,
  });
})();
