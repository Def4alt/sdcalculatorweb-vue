import moment from "moment";
import { err, ok, Result } from "neverthrow";
import { read, WorkSheet, utils } from "xlsx";

export enum SampleType {
	Null = 0,
	Lvl1 = 1,
	Lvl2 = 2
}

export interface Dictionary<T> {
	[x: string]: T;
}

export type ReadModel = {
	SampleType: SampleType;
	FailedTests: string[];
	TestResults: Dictionary<number>;
	Date: string[];
};

export const getDate = (fileName: string): string => {
	const dateCheck = /\d{2}_\d{2}_\d{2}/i;
	const regexArr = dateCheck.exec(fileName);

	if (!regexArr) return new Date().toUTCString();

	const dateString = regexArr[0];

	return moment(dateString, "DD_MM_YY")
		.toDate()
		.toUTCString();
};

export const getValueFromCell = (
	row: number,
	column: number,
	sheet: WorkSheet
): Result<string | boolean | Date | number, Error> => {
	const cellAddress = utils.encode_cell({
		r: row,
		c: column
	});

	const value = sheet[cellAddress];

	if (!value || value.v === undefined)
		return err(new Error(`Failed to get ${cellAddress} cell`));

	return ok(value.v);
};

export const getFailedTests = (sheet: WorkSheet, row: number): string[] => {
	const failedTestsColumn = 5;
	const failedTestsCell = getValueFromCell(row, failedTestsColumn, sheet);

	if (failedTestsCell.isErr()) {
		console.log(failedTestsCell.error.message);
		return [];
	}

	return (failedTestsCell.value as string).split(",");
};

export const getSampleType = (sheet: WorkSheet, row: number): SampleType => {
	const sampleTypeColumn = 3;
	const sampleTypeCell = getValueFromCell(row, sampleTypeColumn, sheet);

	if (sampleTypeCell.isErr()) {
		console.log(sampleTypeCell.error.message);
		return SampleType.Null;
	}

	switch ((sampleTypeCell.value as string).toUpperCase()) {
		case "QC LV I":
			return SampleType.Lvl1;
		case "QC LV II":
			return SampleType.Lvl2;

		default:
			return SampleType.Null;
	}
};

export const getTestTitle = (
	sheet: WorkSheet,
	row: number,
	column: number
): string => {
	const testTitleCell = getValueFromCell(row, column, sheet);

	if (testTitleCell.isErr()) {
		console.log(testTitleCell.error.message);
		return "";
	}

	const testTitle = (testTitleCell.value as string).trim();

	if (testTitle.includes("/")) return "";

	return testTitle;
};

export const getTestValue = (
	sheet: WorkSheet,
	row: number,
	column: number
): Result<number, Error> => {
	const testValueCell = getValueFromCell(row, column, sheet);

	if (testValueCell.isErr())
		return err(new Error("Failed to parse undefine to number"));

	const testValue = testValueCell.value as number;

	if (isNaN(testValue))
		return err(
			new Error(`Failed to parse ${testValueCell.value} to number`)
		);

	return ok(testValue);
};

export const getTestResults = (
	sheet: WorkSheet,
	row: number
): Dictionary<number> => {
	const range = utils.decode_range(sheet["!ref"] || "");
	const valueColumn = 6;
	const startColumn = range.s.c + valueColumn;
	const endColumn = range.e.c;

	const testResults = {} as Dictionary<number>;

	for (
		let currentColumn = startColumn;
		currentColumn <= endColumn;
		currentColumn++
	) {
		const titleRow = 2;
		const testTitle = getTestTitle(sheet, titleRow, currentColumn);

		if (testTitle == "") continue;

		const testValueResult = getTestValue(sheet, row, currentColumn);
		if (testValueResult.isErr()) {
			console.log(testValueResult.error.message);
			continue;
		}

		testResults[testTitle] = Math.round(testValueResult.value * 100) / 100;
	}

	return testResults;
};

export const getReadModel = (
	sheet: WorkSheet,
	row: number,
	fileName: string
): ReadModel => {
	return {
		Date: [getDate(fileName)],
		FailedTests: getFailedTests(sheet, row),
		SampleType: getSampleType(sheet, row),
		TestResults: getTestResults(sheet, row)
	} as ReadModel;
};

export const getModels = (sheet: WorkSheet, fileName: string) => {
	const sheetRange = utils.decode_range(sheet["!ref"] || "");
	const valueRow = 4;
	const startRow = sheetRange.s.r + valueRow;
	const endRow = sheetRange.e.r;

	const models: ReadModel[] = [];

	for (let currentRow = startRow; currentRow <= endRow; currentRow++)
		models.push(getReadModel(sheet, currentRow, fileName));

	return models;
};

export const readFile = (file: File) =>
	new Promise<ReadModel[]>(resolve => {
		const reader = new FileReader();
		reader.readAsBinaryString(file);

		reader.onload = () => {
			const workbook = read(reader.result, {
				type: "binary"
			});

			const sheet = workbook.Sheets[workbook.SheetNames[0]];

			resolve(getModels(sheet, file.name));
		};
	});

export const getReadModels = async (files: File[]): Promise<ReadModel[]> => {
	const types = /(\.xls|\.xlsx)$/i;
	const readModels: ReadModel[] = [];

	for (const file of files) {
		if (!file.name.match(types)) continue;

		await readFile(file).then(parsed =>
			parsed.forEach(model => readModels.push(model))
		);
	}

	return readModels;
};
