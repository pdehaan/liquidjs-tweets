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
// .slice(0, 50);

main("www");

function join(...dirs) {
  return (dir="") => path.join(...dirs, dir);
}

async function main(outputDir="www") {
  const engine = new Liquid({
    root: path.resolve(__dirname, 'views'),
    extname: '.liquid'
  });

  const baseDir = join(__dirname, outputDir);
  await fs.mkdir(baseDir(), { recursive: true });
  
  await writeIndex(baseDir("index.html"), engine);
  await write404(baseDir("404.html"), engine);
  await writeTweets(tweets, baseDir(), engine);
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
  for (const tweet of tweets) {
    const tweetIdBaseDir = join(baseDir, "realDonaldTrump/status", tweet.id.toString());
    await fs.mkdir(tweetIdBaseDir(), { recursive: true });

    await writeTweet(tweetIdBaseDir("index.html"), tweet, engine);
    await writeTweetData(tweetIdBaseDir("data.json"), tweet);
    await writeTweetEmbed(tweetIdBaseDir("embed.html"), tweet, engine);
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
  // output = prettier.format(output, { parser: "html" });
  await fs.writeFile(filename, output);
}

async function writeJson(filename="", output="") {
  // output = prettier.format(output, { parser: "json" });
  await fs.writeFile(filename, output);
}
