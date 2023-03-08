require("dotenv").config();
const express = require("express");
const res = require("express/lib/response");
const app = express();
let ejs = require("ejs");
app.use(express.static(__dirname + "/public"));
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const shortid = require("shortid");

//mongoose set up
const mongoose = require("mongoose");

const connectToDB = async () => {
	try {
		//connection to mongodb
		const c = await mongoose.connect(process.env.MONGO_URI);
		console.log(`Successfully connected to ${c.connection.host}`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

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
		const baseUrl = `${req.protocol}://${req.get("host")}`;
		const URL = await Url.find();
		res.render("index", { URL: URL, baseUrl: baseUrl });
	} catch (error) {
		console.log(error);
	}
});

//POST request for url submission
app.post("/shortUrls", async (req, res) => {
	try {
		if (req.body.fullUrl == "") {
			return res.sendStatus(404);
		} else {
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
		}
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
connectToDB().then(() =>
	app.listen(port, () => {
		console.log(`This server is listening on port ${port}`);
	})
);
