import { err, ok, Result } from "neverthrow";
import { getReadModels } from "./reader";
import { getStatModels, StatModel } from "./statistics";
import Westgard from "./westgard";

export const getWarning = (model: StatModel): string => {
	const westgard = new Westgard();
	return westgard.check(model.Average, model.SD, model.Warnings);
};

export const appendModel = (
	previous: StatModel,
	newModel: StatModel
): StatModel => {
	previous.Average.push(newModel.Average[0]);
	previous.Date.push(newModel.Date[0]);
	previous.Warnings.push(getWarning(previous));

	return previous;
};

export const appendNewModels = (
	previousModels: StatModel[],
	models: StatModel[]
): StatModel[] => {
	const newModels: StatModel[] = [];
	Object.assign(newModels, previousModels);

	models.forEach(model => {
		const newModel = newModels.filter(
			t =>
				t.TestName === model.TestName &&
				t.SampleType === model.SampleType
		)[0];

		if (!newModel) return;

		appendModel(newModel, model);
	});

	return newModels;
};

export const calculate = async (
	files: File[],
	previousModels: StatModel[],
	sdMode: boolean
): Promise<Result<StatModel[], Error>> => {
	const readModels = await getReadModels(files);
	if (readModels.length === 0)
		return err(new Error("Failed to retrieve models from Excel file"));

	const statModels = getStatModels(readModels);
	if (statModels.length === 0)
		return err(new Error("Failed to calculate stats based on Excel data"));

	if (sdMode) return ok(statModels);
	else return ok(appendNewModels(previousModels, statModels));
};
