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
  const { data } = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?key=${process.env.YOUTUBE_API_KEY}&q=${searchQuery}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5`
  );
  if (!data) {
    console.log("youtube fail");
    return null;
  }
  if (data.items[0] == undefined) {
    console.log("youtube fail");
    return null;
  }

  console.log(data.items[0].id.videoId);

  return data.items[0].id.videoId;
}

export async function getTranscript(videoId: string) {
  try {
    let transcript_arr = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en",
      country: "EN",
    });
    let transcript = "";
    for (let t of transcript_arr) {
      transcript += t.text + " ";
    }

    console.log(transcript.replaceAll("\n", ""));
    return transcript.replaceAll("\n", "");

  } catch (error) {
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_name: string
): Promise<Question[]> {
  const systemPrompt = `You are a helpful AI assistant capable of generating MCQ questions and answers in JSON format. Each answer should not be more than 15 words. Generate questions about ${course_name} based on the following transcript:`;

  const userPrompt = new Array(5).fill(
    `Generate an appropriate and challenging MCQ question about ${course_name} with context of the following transcript: ${transcript}`
  );

  // Call strict_output and expect a JSON array of questions
  const response = await strict_output(systemPrompt, userPrompt);
  console.log('response:', response);

  return response ? response as Question[] : [];
}
