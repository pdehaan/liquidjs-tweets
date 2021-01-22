const fs = require("fs/promises");
const path = require("path");

const { Liquid } = require("liquidjs");
const prettier = require("prettier");

let tweets = require("./data/tweets.json");
tweets = tweets.map(tweet => {
  tweet.isRetweet = tweet.isRetweet !== "f";
  tweet.isDeleted = tweet.isDeleted !== "f";
  tweet.isFlagged = tweet.isFlagged !== "f";
  return tweet;
})
.slice(0, 50);

main("www");

async function main(outputDir="www") {
  const engine = new Liquid({
    root: path.resolve(__dirname, 'views'),
    extname: '.liquid'
  });

  const baseDir = path.join(__dirname, outputDir);
  await fs.mkdir(baseDir, { recursive: true });
  
  await writeIndex(path.join(baseDir, "index.html"), engine);
  await write404(path.join(baseDir, "404.html"), engine);
  await writeTweets(tweets, baseDir, engine);
}

async function writeIndex(filename, engine) {
  const output = await engine.renderFile("index");
  await writeHtml(filename, output);
}

async function write404(filename, engine) {
  const output = await engine.renderFile("404");
  await writeHtml(filename, output);
}

async function writeTweets(tweets=[], baseDir="", engine) {
  const tweetBaseDir = path.join(baseDir, "realDonaldTrump/status");
  for (const tweet of tweets) {
    const tweetIdBaseDir = path.join(tweetBaseDir, tweet.id.toString());
    await fs.mkdir(tweetIdBaseDir, { recursive: true });

    await writeTweet(path.join(tweetIdBaseDir, "index.html"), tweet, engine);
    await writeTweetData(path.join(tweetIdBaseDir, "data.json"), tweet);
    await writeTweetEmbed(path.join(tweetIdBaseDir, "embed.html"), tweet, engine);
  }
}

async function writeTweet(filename="", data={}, engine) {
  const output = await engine.renderFile("tweet", {tweet: data});
  await writeHtml(filename, output);
}

async function writeTweetData(filename="", data={}) {
  const output = JSON.stringify(data);
  await writeJson(filename, output);
}

async function writeTweetEmbed(filename="", data={}, engine) {
  const output = await engine.renderFile("tweetEmbed", {tweet: data});
  await writeHtml(filename, output);
}

async function writeHtml(filename="", output="") {
  const $output = prettier.format(output, { parser: "html" });
  await fs.writeFile(filename, $output);
}

async function writeJson(filename="", output="") {
  const $output = prettier.format(output, { parser: "json" });
  await fs.writeFile(filename, $output);
}
