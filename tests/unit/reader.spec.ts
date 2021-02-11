import {
	getDate,
	getFailedTests,
	getModels,
	getReadModel,
	getSampleType,
	getTestResults,
	getTestTitle,
	getTestValue,
	getValueFromCell,
	SampleType
} from "@/helpers/reader";
import { expect } from "chai";
import moment from "moment";
import { CellObject, Sheet, utils } from "xlsx/types";

const sheet: Sheet = {
	A1: { v: 1 } as CellObject,
	A2: { v: "string " } as CellObject,
	A3: { v: "string/" } as CellObject,
	"!ref": "A1:B3"
};

describe("Reader", () => {
	it("Get Value From Cell", () => {
		const value = getValueFromCell(0, 0, sheet);
		if (value.isOk()) expect(value.value).to.be.equal(1);

		expect(getValueFromCell(0, 1, sheet).isErr()).to.be.true;
	});

	it("Get Test Value", () => {
		const value = getTestValue(sheet, 0, 0);

		if (value.isOk()) expect(value.value).to.be.equal(1);

		expect(getTestValue(sheet, 1, 0).isErr()).to.be.true;

		expect(getTestValue(sheet, 0, 1).isErr()).to.be.true;
	});

	it("Get Test Title", () => {
		expect(getTestTitle(sheet, 1, 0)).to.be.equal("string");

		expect(getTestTitle(sheet, 2, 0)).to.be.equal("");

		expect(getTestTitle(sheet, 0, 1)).to.be.equal("");
	});

	it("Get Results", () => {
		const sheet1: Sheet = {
			G3: { v: "Test" } as CellObject,
			G4: { v: 2 } as CellObject,
			"!ref": "A1:G4"
		};

		const result1 = getTestResults(sheet1, 3);

		expect(result1["Test"]).to.be.equal(2);

		const sheet2: Sheet = {};
		const result2 = getTestResults(sheet2, 5);
		expect(result2).to.be.empty;
	});

	it("Get Sample Type", () => {
		const sheet: Sheet = {
			D1: { v: "QC LV I" } as CellObject,
			D2: { v: "qC lV Ii" } as CellObject,
			"!ref": "A1:D2"
		};

		const sampleType1 = getSampleType(sheet, 0);
		const sampleType2 = getSampleType(sheet, 1);

		expect(sampleType1).to.be.equal(SampleType.Lvl1);
		expect(sampleType2).to.be.equal(SampleType.Lvl2);

		expect(getSampleType(sheet, 2)).to.be.equal(SampleType.Null);
	});

	it("Get Failed Tests", () => {
		const sheet: Sheet = {
			F1: { v: "Test,Test2,Test3" } as CellObject,
			F2: { v: "" } as CellObject,
			"!ref": "A1:F2"
		};

		expect(getFailedTests(sheet, 0)).to.have.length(3);
		expect(getFailedTests(sheet, 1)).to.have.length(1);

		expect(getFailedTests(sheet, 2)).to.have.length(0);
	});

	it("Get Date", () => {
		expect(getDate("sdgsgsd20_10_12sdfsdfhsdfh")).to.be.equal(
			moment("20_10_12", "DD_MM_YY")
				.toDate()
				.toUTCString()
		);

		expect(getDate("12_dfsd09_dss21")).to.be.equal(
			new Date().toUTCString()
		);
	});

	const modelSheet: Sheet = {
		F5: { v: "Failed Test" } as CellObject,
		G3: { v: "Test" } as CellObject,
		H3: { v: "Failed Test" } as CellObject,
		G5: { v: 1 } as CellObject,
		H5: { v: 0 } as CellObject,
		D5: { v: "QC lV II" } as CellObject,
		"!ref": "A1:H5"
	};

	it("Get Model", () => {
		const model = getReadModel(modelSheet, 4, "File 20_10_20");

		expect(model.SampleType).to.be.equal(SampleType.Lvl2);
		expect(model.Date[0]).to.be.equal(
			moment("20_10_20", "DD_MM_YY")
				.toDate()
				.toUTCString()
		);
		expect(model.FailedTests[0]).to.be.equal("Failed Test");
		expect(model.TestResults["Test"]).to.be.equal(1);
		expect(model.TestResults["Failed Test"]).to.be.equal(0);
	});

	it("Get Models", () => {
		const models = getModels(modelSheet, "File 20_10_20");

		expect(models).to.have.length(1);
	});
});
