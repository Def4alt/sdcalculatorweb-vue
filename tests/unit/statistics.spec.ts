import { Dictionary, ReadModel, SampleType } from "@/helpers/reader";
import {
	getAverageFor,
	getModel,
	getNonFailedResults,
	getStandardDeviation,
	getStatModels
} from "@/helpers/statistics";
import { expect } from "chai";

const model1: ReadModel = {
	SampleType: SampleType.Lvl1,
	FailedTests: ["Failed Test"],
	TestResults: {
		["Test"]: 10,
		["Failed Test"]: 10
	} as Dictionary<number>,
	Date: ["10/20/20"]
};

const model2: ReadModel = {
	SampleType: SampleType.Lvl1,
	FailedTests: ["Failed Test"],
	TestResults: {
		["Test"]: 30,
		["Failed Test"]: 2
	} as Dictionary<number>,
	Date: ["4/10/20"]
};

const model3: ReadModel = {
	SampleType: SampleType.Lvl2,
	FailedTests: ["Failed Test"],
	TestResults: {
		["Test"]: 20,
		["Failed Test"]: 5
	} as Dictionary<number>,
	Date: ["5/20/10"]
};

const model4: ReadModel = {
	SampleType: SampleType.Lvl2,
	FailedTests: ["Failed Test"],
	TestResults: {
		["Test"]: 50,
		["Failed Test"]: 1
	} as Dictionary<number>,
	Date: ["2/1/20"]
};

describe("Statistics", () => {
	it("Get Non Failed Tests", () => {
		const failed = getNonFailedResults([model1, model2], "Failed Test");
		const passed = getNonFailedResults([model1, model2], "Test");

		expect(failed).to.have.length(0);
		expect(passed).to.have.length(2);
	});

	it("Get Average", () => {
		const nonFailedResults = getNonFailedResults(
			[model1, model2],
			"Test"
		).map(t => t.TestResults["Test"]);

		const failedAverage = getAverageFor([]);
		const expectedAverage = getAverageFor(nonFailedResults);

		expect(failedAverage).to.be.equal(0);
		expect(expectedAverage).to.be.equal(20);
	});

	it("Get Standard Deviation", () => {
		const nonFailedResults = getNonFailedResults(
			[model1, model2],
			"Test"
		).map(t => t.TestResults["Test"]);

		const failedSD = getStandardDeviation([]);
		const expectedSD = getStandardDeviation(nonFailedResults);

		expect(failedSD).to.be.equal(0);
		expect(expectedSD).to.be.equal(10);
	});

	it("Get Statistics Model", () => {
		const statModel1 = getModel(
			[model1, model2, model3, model4],
			"Test",
			SampleType.Lvl1
		);

		expect(statModel1._unsafeUnwrap().Average[0]).to.be.equal(20);

		expect(
			getModel(
				[model1, model2, model3, model4],
				"",
				SampleType.Lvl2
			).isErr()
		).to.be.true;

		expect(getModel([], "Failed Test", SampleType.Lvl1).isErr()).to.be.true;
	});

	it("Get Statistics Models", () => {
		const statModels = getStatModels([model1, model2, model3, model4]);

		expect(statModels).to.have.length(2);

		const statModels1 = getStatModels([]);

		expect(statModels1).to.have.length(0);
	});
});
