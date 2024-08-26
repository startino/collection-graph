import { AzureChatOpenAI } from '@langchain/openai';
import { GraphState } from './state.js';
import { END, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { updateItem } from './tools/index.js';
import type { AIMessage } from '@langchain/core/messages';
import { createCollector } from './agents/collector.js';
import { createAttester } from './agents/attester.js';

export const collectionGraph = async (
	llm: AzureChatOpenAI,
	profile: Record<string, any>
) => {
	const collector = await createCollector(llm, profile);
	const attester = await createAttester(llm);
	const tools = [updateItem];
	const toolNode = new ToolNode<typeof GraphState.State>(tools);

	const graph = new StateGraph(GraphState)
		.addNode('collector', collector.node)
		.addNode('tool_node', toolNode)
		.addNode('attester', attester.node)
		.addEdge(START, 'collector')
		.addConditionalEdges('collector', agentRouter)
		.addEdge('tool_node', 'collector')
		.addEdge('attester', END)

	return graph;
};

export default collectionGraph;

const agentRouter = (state: typeof GraphState.State): 'tool_node' | 'attester' | '__end__' => {
	const messages = state.messages;
	const lastMessage = messages[messages.length - 1] as AIMessage;
	// let content = lastMessage.content as string;
	if (lastMessage?.tool_calls && lastMessage?.tool_calls.length > 0) {
		return `tool_node`;
	}
	if (lastMessage.content.toString().includes('VERIFY')){
		return 'attester';
	}

	return END;
};
