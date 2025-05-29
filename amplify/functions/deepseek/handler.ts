import type { APIGatewayProxyHandler } from "aws-lambda";
import { secret } from '@aws-amplify/backend';

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("event: ", event);

    try {

        const body = JSON.parse(event.body || '{}');
        const prompt = body.prompt || "Failed to get prompt :(";

        // Make the request to the DeepSeek API
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secret('ORDEEPSEEKKEY')}`,
                "Content-Type": "application/json",
                "X-Title": "cussinene"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-prover-v2:free",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    }
                ]
            })
        });

        const result = await response.json(); // Parse the JSON response
        console.log("DeepSeek response:", result);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({
                message: "DeepSeek API call successful",
                data: result,
            }),
        };

    } catch (error) {
        console.error("DeepSeek API error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to call DeepSeek API",
                details: (error as Error).message,
            }),
        };
    }
};
