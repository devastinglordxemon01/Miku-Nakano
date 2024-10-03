const fs = require("fs");
const globalUPoLAPI = 'https://upol-nijiy.onrender.com';
const path = require("path");
const axios = require("axios");
module.exports = {
  config: {
    name: "nijix",
    aliases: ["nijiy"],
    author: "UPoL🐔",
    version: "1.0",
    cooldowns: 20,
    role: 0,
    shortDescription: "Generate an image based on a prompt using the XL API.",
    longDescription: "Generates an image using the provided prompt and streams the image to the chat.",
    category: "ai",
    guide: "{pn} <prompt> --ar 16:9",
  },
  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return api.sendMessage("❌ | You need to provide a prompt.", event.threadID);
    }
    const startTime = Date.now(); 
    api.sendMessage("Please wait, generating your image...", event.threadID, event.messageID);
    try {
      const apiUrl = `${globalUPoLAPI}/xl31?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.imageUrl;
      if (!imageUrl) {
        return api.sendMessage("❌ | Failed to generate image. Please try again later.", event.threadID);
      }
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });
      const cacheFolderPath = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheFolderPath)) {
        fs.mkdirSync(cacheFolderPath);
      }
      const imagePath = path.join(cacheFolderPath, `${Date.now()}_generated_image.png`);
      fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, "binary"));
      const stream = fs.createReadStream(imagePath);
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
      message.reply({
        body: `✅ | Here is your image!\n\n🕒 Image generated in ${generationTime} seconds.`,
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error);
      return api.sendMessage("❌ | An error occurred. Please try again later.", event.threadID);
    }
  }
};