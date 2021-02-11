import { expect } from "chai";
import Westgard from "@/helpers/westgard";

const westgard = new Westgard();

describe("Westgard", () => {
	it("13S Rule Check", () => {
		expect(westgard.check([0, 4], 1, [])).to.be.equal("13S");
	});

	it("R4S Rule Check", () => {
		expect(westgard.check([0, 3, -3], 1, [])).to.be.equal("R4S");
	});

	it("22S Rule Check", () => {
		expect(westgard.check([0, 3, 3], 1, [])).to.be.equal("22S");
	});

	it("41S Rule Check", () => {
		expect(westgard.check([0, 2, 2, 2, 2], 1, [])).to.be.equal("41S");
	});

	it("8X Rule Check", () => {
		expect(westgard.check([0, 1, 1, 1, 1, 1, 1, 1, 1], 1, [])).to.be.equal(
			"8X"
		);
	});

	it("No Warning Check", () => {
		expect(westgard.check([0, 0], 1, [])).to.be.equal(" ");
	});
});
