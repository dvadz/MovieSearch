'use strict'
var debug = true;
console.log("app.js")

var movieSearch = {
     i: ""
    ,t: ""
    ,type: "movie"
    ,y: ""
    ,plot: "full"
    ,s: ""                              //THIS IS THE CURRENT USAGE
    ,page: "1"
    ,website: "https://www.omdbapi.com/?"
    ,apikey: "trilogy"
    ,url: "" 
    ,responses: []  //TODO: WARNING 'page' is used as the index, 'page' starts at 1 and so [0] will be unused
    ,totalNumberOfPages: 0
    ,initSearch: function() {
        if(debug){console.log("initSearch")}
        this.responses = [];
        this.page = 1;
        this.totalNumberOfPages = 0;
    }
    ,saveSearchParameters(s) {
        this.s = s;
    }
    ,createTheQueryURL: function(){
        this.url = this.website + "s=" + this.s + "&type=" + this.type + "&page=" + this.page + "&apikey=" + this.apikey;
        if(debug){console.log(this.url)}
    }
    ,get queryURL(){
        if(debug){console.log("get url: ", this.url)}
        return this.url;
    }
    ,get pageNumber() {
        if(debug){console.log("get page: ", this.page )}
        return this.page;
    }
    ,set pageNumber(pageNumber){
        if(debug){console.log("set page: ", this.page)}
        this.page = pageNumber;
    }
    ,getAPageOfResults: function(){
        return this.responses[this.page];
    }

};

// SETUP EVENTS ----------------------------------------------
$(document).ready(function(){

    if(debug){console.log("document is ready")}
    $("#btn-search").on("click", function(){
        event.preventDefault();
        if(debug){console.log("Event: clicked on 'Search'");}        
        
        //if Search box is empty and user clicks SEARCH or presses ENTER, do nothing
        if($("#input-search").val()==="") {
            if(debug){console.log("No search string, terminating...");}        
            return false;
        
        //Start the search and provide the search parameters
        } else {
            startANewSearchOnOMDB($("#input-search").val());
        }
    });

    $(".div-pages").on("click", function(event){
        if(debug){console.log("Event: clicked on a page button")}       
    
        // TWO conditions required in order to take action:
        // 1. user clicked on a page button
        // 2. page is NOT the current page
        if(event.target.className === "pages" && movieSearch.page != event.target.value){
            var page = event.target.value;
            console.log("Page requested: ", page);
            getAnotherPage(page);
        } else {
            if(debug) {
                if(event.target.className != "pages"){
                    console.log("You didn't click on a page button");
                } else {
                    console.log("You are already on that page");
                }
            }
        }

    });
});

// START A SEARCH --------------------------------------------

function startANewSearchOnOMDB(){
    if(debug){console.log("function: startANewSearchOnOMDB");}
   
    //clear all previous search parameters and results
    movieSearch.initSearch();
    //empty the previous search from the screen
    initDisplay()
    saveAllParameters();
    movieSearch.createTheQueryURL();
    sendAjaxQuery(movieSearch.queryURL);
} 

function sendAjaxQuery(url){
    if(debug){console.log("function: sendAjaxQuery")}

    //check whether the page is in the 'movieSearch.responses' array
    if(movieSearch.responses[movieSearch.page]===undefined){
        if(debug){console.log("function: sendAjaxQuery - sending ajax request")}
        $.ajax({ 
            url: url, 
            method: "GET"
        }).then(function(response){ 
            if(debug){console.log("Ajax response", response);}
            processQueryResults(response);
        });
    } else {
        if(debug){console.log("function: sendAjaxQuery - NOOooo ajax request")}
        var onePage = movieSearch.getAPageOfResults();
        //Proceed to display results
        displayAPage(onePage);      
    }

}

function processQueryResults(response){
    if(debug) {console.log("function: processQueryResults", response)}

    //SAVE query results and check return status, if FALSE then show a failed message
    var status = saveResponse(response);

    //if TRUE, query was successful
    if(status) {
        //grab a page of results
        var onePage = movieSearch.getAPageOfResults();
        //Proceed to display results
        displayAPage(onePage);
    } else {
        displayFailed()
    }
}

 
function saveResponse(response){
    if(debug){console.log("function: saveResponse: ", response)}

    //IF Successful
    if(response.Response) {
        movieSearch.responses[movieSearch.page] = response.Search;
        console.log(movieSearch.responses);
        //calculate number of pages
        movieSearch.totalNumberOfPages = Math.ceil((response.totalResults/10))
        //display butons for pages
        createPageButtons();
        return true;
    //QUERY HAD AN ERROR FOR WHATEVER REASON
    } else {
        return false;
    }

}

function saveAllParameters(){
   //save all arguments provided by user
   movieSearch.saveSearchParameters($("#input-search").val());
   if(debug){console.log("Search: ", movieSearch.s);}        
}

function getAnotherPage(page) {
    clearResults();
    movieSearch.pageNumber = page;
    movieSearch.createTheQueryURL();
    sendAjaxQuery(movieSearch.queryURL);
}

// ALL ABOUT DISPLAYING -------------------------------------------------

function displayFailed() {
    if(debug){console.log("query failed. try again.")}
    //TODO: inform the user of the error
}

function displayAPage(onePage){
    if(debug){console.log("function: displayAPage ", onePage)}
    onePage.forEach(function(aMovie){
        if(debug){console.log(aMovie)}
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

function initDisplay() {
    //empty out the div
    clearResults();
    //hide the page buttons
}

function clearResults() {
    $(".results").empty();
}

// PAGE BUTTONS ------------------------------------------
function createPageButtons(){
    var numberOfPages  = movieSearch.totalNumberOfPages;
    if(debug){console.log("function: createPageButtons ", numberOfPages)}
    for( var i = 1; i < numberOfPages+1; i++) {
        var newButton = $("<button></button>").text(i).attr("value", i).addClass("pages");
        $(".div-pages").append(newButton);
    }
}