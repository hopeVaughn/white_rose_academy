import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  model: string = "gpt-3.5-turbo-1106",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
) {
  for (let i = 0; i < num_tries; i++) {
    const response = await openai.chat.completions.create({
      model: model,
      temperature: temperature,
      messages: [
        { "role": "system", "content": system_prompt },
        { "role": "user", "content": user_prompt.toString() },
      ],
      response_format: { type: "json_object" },
    });

    let output = response.choices[0].message?.content;

    if (verbose) {
      console.log("System prompt:", system_prompt);
      console.log("User prompt:", user_prompt);
      console.log("GPT response:", output);
    }

    try {
      const parsedOutput = output ? JSON.parse(output) : null;

      // Using Array() constructor to convert the object to an array
      const arrayOutput = Array(parsedOutput);
      console.log("GPT FUNCTION TO ARRAY: ", arrayOutput);
      return arrayOutput;
    } catch (e) {
      console.error("An exception occurred:", e);
      throw new Error("Invalid JSON format or no response received");
    }
  }
  return null;
}
