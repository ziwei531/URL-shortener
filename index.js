const express = require("express");
const res = require("express/lib/response");
const app = express();
let ejs = require("ejs");
app.use(express.static(__dirname + "/public"));
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const shortid = require("shortid");
const uri =
	"mongodb+srv://ziwei531:u3cG96LiJ171CWlk@cluster0.rtpncsr.mongodb.net/test";

//mongoose set up
const mongoose = require("mongoose");
main()
	.then(() => console.log("Successfully connected to mongodb"))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(uri);
}

//create schema
const urlSchema = new mongoose.Schema({
	originalURL: { type: String, required: true },
	shortURL: { type: String, required: true },
});

const Url = mongoose.model("Url", urlSchema);

//req = request
//res = response

//app.set is used to set the view engine
app.set("view engine", "ejs");

//app.use is used to set the middleware. this is so that url will be functional
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req, res) => {
	try {
		const URL = await Url.find();
		res.render("index", { URL: URL });
	} catch (error) {
		console.log(error);
	}
});

//POST request for url submission
app.post("/shortUrls", async (req, res) => {
	try {
		//create a new url
		const originalURL = req.body.fullUrl;
		const shortURL = shortid.generate();
		const url = new Url({
			originalURL: originalURL,
			shortURL: shortURL,
		});
		//save the url to the database
		await url.save();
		res.redirect("/");
	} catch (error) {
		console.log(error);
	}
});

app.get("/:shortUrl", async (req, res) => {
	try {
		const shortUrl = await Url.findOne({ shortURL: req.params.shortUrl });

		if (shortUrl == null) {
			return res.sendStatus(404);
		}

		res.redirect(shortUrl.originalURL);
	} catch (error) {
		console.log(error);
	}
});

let port = process.env.PORT || 5000;
const server = app.listen(port, () => {
	console.log(`This server is listening on port ${port}`);
});

process.once("SIGUSR2", () => {
	// Perform any necessary cleanup here
	server.close(() => {
		console.log("Releasing port ${port}");
		process.kill(process.pid, "SIGUSR2");
	});
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.log(`Port ${port} is in use, trying another port`);
		setTimeout(() => {
			server.close();
			server.listen(++port);
		}, 1000);
	}
});
