const express = require('express')
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const axios = require("axios").default;
const path = require('path');

const Schema = mongoose.Schema;


const app = express();
const port = 3000;

const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology']
let weather = null;

//Scheme
const articleScheme = new Schema({
    title: String,
    category: String,
    description: String,
    content: String,
    publishedAt: {
		type: Date,
		default: Date.now
	},

});
const Article = mongoose.model("Article", articleScheme);

// connect to MongoDB
mongoose.connect("mongodb://localhost:27017/news_db", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, async function(err){
    if(err) return console.log(err);
    console.log('MongoDB connected');
    await getWeather();
    app.listen(port, () => console.log(`News app Started on port ${port}!`));
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//setup public folder
app.use(express.static('./public'));

//setup middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.get('/', async function (req, res) {
    let {
        category,
        whose
    } = req.query

    let articles = [];

    switch (whose) {
        case 'world':
            const options = {
                method: 'GET',
                url: 'https://newsapi.org/v2/top-headlines',
                params: {
                    apiKey: '97ab21ca660448029ac602ee457c2939',
                    ...category ? {category} : {},
                    language: 'en'
                },
            };

            articles = (await axios.request(options)).data.articles;
            break;

        case 'my':
            articles = await Article.find({
                ...category ? {category} : {}
            });
            break;

        default:
            break;
    }

    res.render('pages/news',{
        news: articles,
        categories,
        filters: {
            category,
            whose
        },
        weather
    })
});
app.get('/aboutus',async function(req,res){
  res.render('pages/aboutus')
})
app.get('/create', async function (req, res) {
    res.render('pages/create',{
        categories,
        article: null,
        weather
    })
});

app.post('/store', async (req, res) => {
    await Article.create({
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        content: req.body.content
    })

    res.redirect( `/`);
});

app.get('/edit/:articleId', async function (req, res) {

    const article = await Article.findById(req.params.articleId);

    if (!article) res.send('Article not found');/*status*/

    res.render('pages/create',{
        categories,
        article,
        edit: true,
        weather
    })
});


app.post('/update/:articleId', async function (req, res) {
    const article = await Article.findById(req.params.articleId);

    if (!article) res.send('Article not found');

    await Article.findByIdAndUpdate({
            _id: article._id
    }, {
        $set: {
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            content: req.body.content
        }
    })

    res.redirect( `/`);
});

app.get('/delete/:articleId', async function (req, res) {
    const article = await Article.findById(req.params.articleId);

    if (!article) res.send('Article not found');

    await article.remove();

    res.redirect( `/`);
});

const getWeather = async function() {
    const options = {
        method: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/weather',
        params: {
            appid: '708142539eaef91d8a8ce840810afbac',
            units: 'metric',
            q: 'Nur-Sultan'
        },
    };

    weather = (await axios.request(options)).data
}
