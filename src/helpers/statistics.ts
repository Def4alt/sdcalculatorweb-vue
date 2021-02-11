import { err, ok, Result } from "neverthrow";
import { ReadModel, SampleType } from "./reader";

export type StatModel = {
  Average: number[];
  SD: number;
  TestName: string;
  SampleType: SampleType;
  Date: string[];
  Warnings: string[];
};

export const getAverageFor = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;

  return numbers.reduce((s1, s2) => s1 + s2, 0.0) / numbers.length;
};

export const getStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;

  const average = getAverageFor(numbers);

  const sqSum = numbers.reduce(
    (s1, s2) => s1 + ((s2 - average) * (s2 - average)) / numbers.length,
    0
  );

  return Math.sqrt(sqSum);
};

export const getNonFailedResults = (
  models: ReadModel[],
  testName: string
): ReadModel[] => {
  return models
    .filter((t) => !t.FailedTests.includes(testName.trim()))
    .filter((t) => testName in t.TestResults);
};

export const getModel = (
  models: ReadModel[],
  testName: string,
  sampleType: SampleType
): Result<StatModel, Error> => {
  const levelModels = models.filter((t) => t.SampleType === sampleType);
  const nonFailedResults = getNonFailedResults(levelModels, testName).map(
    (t) => t.TestResults[testName]
  );

  if (nonFailedResults.length === 0) {
    return err(
      new Error(
        `There is no non failed results of this test and level: ${testName} Lvl${sampleType}`
      )
    );
  }

  return ok({
    Average: [getAverageFor(nonFailedResults)],
    SD: getStandardDeviation(nonFailedResults),
    TestName: testName.trim(),
    SampleType: sampleType,
    Date: [levelModels[0].Date[0]],
    Warnings: [" "],
  } as StatModel);
};

export const getStatModels = (models: ReadModel[]): StatModel[] => {
  const validModels = models.filter((t) => t.SampleType !== SampleType.Null);

  if (validModels.length === 0) {
    console.log("There is no valid read models");
    return [];
  }

  const row = validModels[0];

  if (!row) {
    console.log("Failed to get test results titles from row");
    return [];
  }

  const testResultsLength = Object.keys(row.TestResults).length;

  const statisticsModels: StatModel[] = [];

  for (let i = 0; i < testResultsLength; i++) {
    const testName = Object.keys(row.TestResults)[i];

    if (!testName) continue;

    const modelOne = getModel(validModels, testName, SampleType.Lvl1);

    if (modelOne.isOk()) statisticsModels.push(modelOne.value);

    const modelTwo = getModel(validModels, testName, SampleType.Lvl2);

    if (modelTwo.isOk()) statisticsModels.push(modelTwo.value);
  }

  return statisticsModels;
};
