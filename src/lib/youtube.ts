import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { strict_output } from "./gpt";

type Question = {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
};

export async function searchYoutube(searchQuery: string) {
  searchQuery = encodeURIComponent(searchQuery);
  console.log(`Searching YouTube for query: ${searchQuery}`);

  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  );

  console.log(`YouTube search result:`, data);

  if (!data) {
    console.error("YouTube search failed: No data received.");
    return null;
  }

  if (!data.items[0]) {
    console.error("YouTube search failed: No items found.");
    return null;
  }

  console.log(`YouTube video ID found: ${data.items[0].id.videoId}`);
  return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  console.log(`Fetching transcript for video ID: ${videoId}`);

  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });

    let transcript = transcript_arr.map(t => t.text).join(" ");
    console.log(`Transcript fetched for video ID: ${videoId}`);

    return transcript.replaceAll("\n", " ");
  } catch (error) {
    console.error(`Failed to fetch transcript for video ID ${videoId}:`, error);
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_name: string
): Promise<Question[]> {
  const systemPrompt = `...`; // Your system prompt
  const userPrompts = new Array(2).fill(
    `Generate an appropriate and challenging MCQ question about ${course_name} with context of the following transcript: ${transcript}`
  );

  console.log(`Generating questions for course: ${course_name}`);

  const questions: Question[] = [];

  for (const userPrompt of userPrompts) {
    const response = await strict_output(systemPrompt, userPrompt) as Question[] | null;

    console.log(`Response from strict_output:`, response);

    if (response && Array.isArray(response)) {
      questions.push(...response);
    } else {
      console.warn(`Response from strict_output was not an array for prompt: ${userPrompt}`);
    }
  }

  console.log(`Total questions generated: ${questions.length}`);
  return questions;
}
