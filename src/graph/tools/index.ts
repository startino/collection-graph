import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { z } from 'zod';

// export const updateItem = new DynamicStructuredTool({
// 	name: 'update_item',
// 	description: 'updates value of a particular item',
// 	schema: z.object({
// 		key: z.any().describe('the key of the item to be updated from the list'),
// 		value: z.any().describe('the value to be updated'),
// 		data_list: z.record(z.string()).describe('the list with items filled so far')
// 	}),
// 	func: async ({ key, value, data_list }, runManager, config) => {
// 		let filled_items = data_list;

// 		if (!filled_items) return 'No List found.';

// 		filled_items[key] = value;

// 		return {filled_items};
// 	},
// });

export const updateItem = tool(({label, value}, config) => {
	const data = config.configurable.data;
	data[label] = value;
	return data;
}, {
	name: "update_item",
	description: "updates item in the list",
	schema: z.object({
		label: z.string().describe('The label of the item being updated'),
		value: z.string().describe('The magnitude of the value entered by human')
	})
})
