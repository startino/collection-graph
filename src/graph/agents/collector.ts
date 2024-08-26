import type { AzureChatOpenAI } from '@langchain/openai';
import { createAgent, runNode } from './index.js';
import type { GraphState } from '../state.js';
import { updateItem } from '../tools/index.js';
import { RunnableConfig } from '@langchain/core/runnables';

const examples = `
                Here is an example conversation for you to refer to.
                REMEMBER: these are just examples and not the exact questions.
                For questions you always need to look at the list provided to you.

                Examples:

                AI: Hey, I need to collect some information for your profile! To start off with, what's your name?
                user: I'm Chinmay Pandya

                AI: Thanks Chinmay, What is your email address?
                user: chinmay@gmail.com

                AI: What would you like to set your password? Avoid using spaces :)
                user: chinmay123

                AI: Alright! may I know where you live?
                user: Gujarat, India.

                AI: Beautiful place! Now, how old are you?
                user: about 20 years old

                AI: Thanks for the information Chinmay, I've saved all the information now and we can move further to your goals!
            `;

export const createCollector = async (llm: AzureChatOpenAI, profile: {[key:string]:string}) => {

	const agent = await createAgent({
		llm,
		tools: [updateItem],
		systemMessage: `
            You are an AI assistant responsible for collecting data items from user and 
            updating in the list using your tool.
            You have access to the following tools: {tool_names}
            User profile: ${profile}
        `,
		instructions: `
            You need to collect information about: {item_list}.
            Here is the metadata for the items: {item_list_metadata}.
            Your task is to collect information for each item and make sure
            that the value for every item is present in this object: {data}
            You should always ask for values and update ONE BY ONE and ONE AT A TIME.
            Always follow the order of asking from the list.
            If user enters any irrelevant input to your question, ask him/her again.
            If the input is valid, use your tools to update the information in the list.
            If all items have been updated, always output a single word VERIFY.
        `,
		chatExamples: examples,
	});

	const node = (state: typeof GraphState.State, config: RunnableConfig) =>
		runNode({ state, config, agent, name: 'collector' });

	return {
		agent,
		node,
	};
};
