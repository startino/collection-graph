import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export const GraphState = Annotation.Root({
	messages: Annotation<BaseMessage[]>({
		reducer: (x, y) => (x ?? []).concat(y ?? []),
		default: () => []
	}),
	item_list: Annotation<string[]>,
	item_list_metadata: Annotation<object>,
	data: Annotation<object>
	// data: Annotation<object[]>({
	// 	reducer: (x, y) => (x ?? []).concat(y ?? []),
	// 	default: () => []
	// })
	// final_data: Annotation<object | null>
});
