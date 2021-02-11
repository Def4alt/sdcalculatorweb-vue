import { appendModel, appendNewModels, getWarning } from "@/helpers/calculator";
import { SampleType } from "@/helpers/reader";
import { StatModel } from "@/helpers/statistics";
import { expect } from "chai";

describe("Calculator", () => {
	it("Get Warning", () => {
		const model = {
			Average: [0, 0],
			SD: 1,
			Warnings: [" "]
		} as StatModel;

		let warning = getWarning(model);
		expect(warning).to.be.equal(" ");

		model.Average = [0, 4];
		warning = getWarning(model);
		expect(warning).to.be.equal("13S");

		model.Average = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1];
		warning = getWarning(model);
		expect(warning).to.be.equal("8X");
	});

	it("Append Statistics Model", () => {
		const model = {
			Average: [0],
			Date: [""],
			SD: 5,
			Warnings: [" "]
		} as StatModel;
		const model2 = {
			Average: [16],
			Date: [""],
			SD: 2,
			Warnings: [" "]
		} as StatModel;
		const result = appendModel(model, model2);

		expect(result.Average).to.have.length(2);
		expect(result.SD).to.be.equal(5);
		expect(result.Warnings[1]).to.be.equal("13S");
	});

	it("Append New Models", () => {
		const model1 = {
			Average: [0],
			TestName: "Test",
			SD: 1,
			Warnings: [" "],
			Date: [""],
			SampleType: SampleType.Lvl1
		} as StatModel;
		const model2 = {
			Average: [4],
			TestName: "Test",
			SD: 4,
			Warnings: [" "],
			Date: [" "],
			SampleType: SampleType.Lvl1
		} as StatModel;

		const models = appendNewModels([model1], [model2]);

		expect(models).to.have.length(1);
		expect(models[0].Average).to.have.length(2);
		expect(models[0].Warnings[1]).to.be.equal("13S");
	});
});
