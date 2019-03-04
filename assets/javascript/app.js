'use strict'
var debug = true;
console.log("app.js")

var movieSearch = {
     i: ""
    ,t: ""
    ,type: "movie"
    ,y: ""
    ,plot: ""
    ,s: ""                              //THIS IS THE CURRENT USAGE
    ,page: ""
    ,website: "https://www.omdbapi.com/?"
    ,apikey: "apikey=trilogy"
    ,url: "" 
    ,response: {}
    ,initResponse: function() {
        this.response = {};
    }
    ,saveSearchString(s) {
        this.s = s;
    }
};


$(document).ready(function(){

    if(debug){console.log("document is ready")}
    $("#btn-search").on("click", function(){
        event.preventDefault();
        if(debug){console.log("Event: clicked on 'Search'");}        
        movieSearch.saveSearchString(s) = $("#input-search").val();
        if(debug){console.log("Search: ", movieSearch.searchString);}        
        startANewMovieSearchOnOMBD();
       
    });
});

function startANewMovieSearchOnOMBD(){
    if(debug){console.log("function: performMovieSearchOnOMDB");}
    var queryURL = "https://www.omdbapi.com/?s=" + movieSearch.s + "&type=movie&y=&page=1&apikey=trilogy";

    $.ajax({ 
        url: queryURL, 
        method: "GET"
    }).then(function(response){ 
        movieSearch.response.push();
        parse();
    });
}

function buildTheURLString(){

}

function parse(){
    if(debug){console.log("function: parse ")}

    var movies = movieSearch.response.Search;
    console.log(movies)
    movies.forEach(function(aMovie){
        var card = createACard(aMovie);
        appendCardToResults(card);
    });
}

function createACard(aMovie){
    var card, img, card_body, title, year;

    card = $("<div>").addClass("card").attr("imdbID", aMovie.imdbID);
    img = $("<img>").attr("src",aMovie.Poster);
  
    card_body = $("<div>").addClass("card-body");
    title = $("<h6>").addClass("card-title").text(aMovie.Title);
    year = $("<p>").addClass("year").text(aMovie.Year);

    card_body.append(title).append(year);
    card.append(img).append(card_body);
    return card;
}

function appendCardToResults(card) {
    $("div.results").append(card);
}
