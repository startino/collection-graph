import type {
	AIMessage,
	HumanMessage,
	ToolMessage
} from '@langchain/core/messages';
export type Json = {[key:string]:any}
export type AnyMessage = AIMessage | HumanMessage | any;