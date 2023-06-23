const mongoose = require('mongoose')
const express = require('express')
const ShortUrl = require('./models/shortUrl');
const app = express()
const Port = 5000;

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

// console.log(process.env.MONGO_URI);

mongoose.connect( process.env.MONGO_URI , {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine' , 'ejs')
app.use(express.urlencoded({ extended: false }))

// app.get()
app.get('/' , async (req , res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index' , {shortUrls : shortUrls})
})

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl , notes: req.body.notes})

  res.redirect('/')
})



//USING TRY AND CATCH SINCE GETTING ERROR IN USING CALLBACK FUNCTION
app.get('/delete/:id' , (req , res , next) => {
    ShortUrl.findByIdAndDelete({_id: req.params.id})
    .then(() => {
          // res.send('User deleted successfully.');
          res.redirect('/')
     })
    .catch((error) => {
          res.status(500).send('Error in deleting user.');          
    });
          

})

// SEARCH ITEM
app.post('/search' , async(req , res) => {

    //searchTerm
    // `^${query}`
    try {
      let searchTerm = req.body.searchTerm;
      let items = await ShortUrl.find( { $text: { $search: searchTerm, $diacriticSensitive: false } });
      // let items = await shortUrl.filter( { ^${text}: { $search: searchTerm, $diacriticSensitive: false } });
      // res.json(items);
      res.render('search' , {items : items} );
    } catch (error) {
      res.status(500).send('Error has occured.');
    }
})




app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full)
})

app.listen(Port);


