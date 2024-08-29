import type { AIMessage } from '@langchain/core/messages';
import {ChatPromptTemplate, MessagesPlaceholder} from '@langchain/core/prompts';
import { Runnable, type RunnableConfig, type RunnableInterface } from '@langchain/core/runnables';
import { AzureChatOpenAI } from '@langchain/openai';
import type { StructuredTool } from '@langchain/core/tools';
import { GraphState } from '../state.js';

export const createAgent = async ({
	llm,
	tools,
	systemMessage,
	instructions,
	chatExamples,
}: {
	llm: AzureChatOpenAI;
	tools?: StructuredTool[];
	systemMessage: string;
	instructions?: string;
	chatExamples?: string;
}): Promise<Runnable> => {
	const toolNames = tools?.map((tool) => tool.name).join(', ') ?? '';

	let prompt = ChatPromptTemplate.fromMessages([
		['system', systemMessage],
		['system', instructions ?? ''],
		new MessagesPlaceholder('messages'),
		['system', chatExamples ?? ''],
	]);

	if (tools) {
		prompt = await prompt.partial({
			tool_names: toolNames,
		});

		return prompt.pipe(llm.bindTools(tools));
	}

	return prompt.pipe(llm);
};

type AgentNodeProps = {
	state: typeof GraphState.State;
	config: RunnableConfig;
	agent: Runnable;
	name: string;
};

export async function runNode(props: AgentNodeProps) {
	const { state, agent, name, config } = props;

	// const messages = state.messages;
	// const item_list = state.item_list;
	// const item_list_metadata = state.item_list_metadata;
	// const data = state.data;

	// console.log('DATA', data);

	let result = (await agent.invoke(state, config)) as AIMessage;

	result.name = name;

	return {
		messages: [result]
	};
}
