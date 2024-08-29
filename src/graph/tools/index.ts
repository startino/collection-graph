import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { GraphState } from '../state.js';
import { AIMessage, ToolMessage } from '@langchain/core/messages';

export const updateItem = tool(({label, value}) => {
	return {[label]: value};
}, {
	name: "update_item",
	description: "updates item in the list",
	schema: z.object({
		label: z.string().describe('The label of the item being updated'),
		value: z.any().describe('Only the magnitude of the value entered by human')
	})
})

export const toolNode = async (state: typeof GraphState.State) => {

	const {messages} = state;
	const lastMessage = messages[messages.length - 1] as AIMessage;
	const outputMessages: ToolMessage[] = [];
	// let data:object[] = [];
	
	const prev_data = state.data;
	let data;
	if (lastMessage.tool_calls.length > 0){
		for (const toolCall of lastMessage.tool_calls){
			try {
			  const toolResult = await updateItem.invoke(toolCall);
			  try {
				data = {...prev_data, ...JSON.parse(toolResult.content)};
			  } catch (error) {
				console.log(error);
			  }
			  outputMessages.push(toolResult);
			} catch (error: any) {
			  // Return the error if the tool call fails
			  outputMessages.push(
				new ToolMessage({
				  content: error.message,
				  name: toolCall.name,
				  tool_call_id: toolCall.id!,
				  additional_kwargs: { error }
				})
			  );
			}
		}
	}
	// let final_data = {};
	// let final_list = [...prev_data, ...data];
	// for(const item of final_list){
	// 	console.log(final_data, item);
	// 	final_data = {...final_data, ...item}
	// }

	return {messages: outputMessages, data}
}
