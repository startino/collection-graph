import { AzureChatOpenAI } from "@langchain/openai";
import { createAgent, runNode } from "./index.js";
import { GraphState } from "../state.js";
import { RunnableConfig } from "@langchain/core/runnables";

export const createAttester = async (
    llm: AzureChatOpenAI
) => {
    const agent = await createAgent({
        llm,
        systemMessage: `You are an attester who verifies one last time with the user
        before proceeding with the next step.`,
        instructions: `
        data is which meant to be verified: {data}
        Summarize this data to the user asking him if he wants to proceed with it or change
        something. If the user does not want to change, answer with "Your data has been stored successfully".
        `
    });

    const node = (state: typeof GraphState.State, config: RunnableConfig) =>
		runNode({ state, config, agent, name: 'attester' });

	return {
		agent,
		node,
	};
}