import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    // Check if the URL is a YouTube link
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL." });
      }

      const title = await fetchYouTubeTitle(videoId);
      return res.status(200).json({ title });
    }

    // For other URLs, fetch the website title
    const title = await fetchWebsiteTitle(url);
    return res.status(200).json({ title });
  } catch (error) {
    console.error("Error fetching title:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch title", details: error.message });
  }
}

function extractYouTubeVideoId(url) {
  const regex = /(?:v=|youtu\.be\/|\/v\/|embed\/|v\/|shorts\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function fetchYouTubeTitle(videoId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

  const response = await axios.get(apiUrl);
  const videoData = response.data;

  if (videoData.items && videoData.items.length > 0) {
    return videoData.items[0].snippet.title;
  }

  throw new Error("Unable to fetch YouTube video title.");
}

async function fetchWebsiteTitle(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });
      const html = response.data;
      const $ = cheerio.load(html);
      return $("title").text().trim();
    } catch (error) {
      console.error("Website fetch error:", error.response?.status, error.message);
      throw new Error("Failed to fetch website title");
    }
  }
