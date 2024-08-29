import { MemorySaver } from "@langchain/langgraph";
import collectionGraph from "./graph/index.js";
import { AzureChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import readline from 'readline';

const data = {};

const item_list_metadata = {
    'weight': {
        unit: 'kg',
        data_type: 'number'
    },
    'height': {
        unit: 'cm',
        data_type: 'number'
    },
    'age': {
        unit: 'number',
        data_type: 'number'
    },
    'blood group': {
        unit: 'blood group',
        data_type:'string'
    },
    'diabetes': {
        unit: 'yes or no',
        data_type: 'string'
    }
}

const item_list:string[] = [];

for (const key in item_list_metadata){
    item_list.push(key)
}

const profile = {
    name: 'Chinmay'
};

const AZURE_OPENAI_API_KEY='ac8034f9b90c4df6b21f0e030ad42e7e';
const AZURE_OPENAI_API_VERSION='2024-02-01';
const AZURE_OPENAI_API_INSTANCE_NAME='startino';
const AZURE_OPENAI_API_DEPLOYMENT_NAME='gpt-4o';

const llm = new AzureChatOpenAI({
    model: 'gpt-4o',
    azureOpenAIApiKey: AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: AZURE_OPENAI_API_DEPLOYMENT_NAME,
    temperature: 0.5,
});

const workflow = await collectionGraph(llm, profile);

const checkpointer = new MemorySaver();

const app = workflow.compile({ checkpointer });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const callGraph = async () => {
    const intro = await app.invoke({
        messages: [new HumanMessage('Hi')],
    }, {
        configurable: { thread_id: "42", item_list, item_list_metadata, data} 
    });
    
    console.log(intro.messages[intro.messages.length -1].content);
    
    
    const askQuestion = () => {
        rl.question('User: ', async (input) => {
    
            if (input.toLowerCase() == 'exit'){
                rl.close();
                return;
            }
        
            const finalState = await app.invoke({
                messages: [new HumanMessage(input)],
                item_list,
                item_list_metadata
            }, {
                configurable: { thread_id: "42"} 
            });
    
            console.log(finalState.messages[finalState.messages.length -1].content);
            // console.log("DATA", finalState.final_data);
    
            askQuestion();
            
        });
    };
    
    askQuestion();
}

callGraph();




