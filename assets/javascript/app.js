'use strict'
var debug = true;
console.log("running 'app.js'")


$(".list, .individual").hide();

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
    ,responses: []  // WARNING 'page' is used as the index, 'page' starts at 1 and so [0] will be unused
    ,itemDetails: {}
    ,totalNumberOfPages: 0
    ,startPage: 1
    ,pageOnDisplay: 1
    ,initSearch: function() {
        if(debug){console.log("initSearch")}
        this.responses = [];
        this.page = 1;
        this.totalNumberOfPages = 0;
        this.startPage = 1;
    }
    ,saveSearchParameters(s) {
        this.s = s;
    }
    ,createTheQueryURL: function(){
        this.url = this.website + "s=" + this.s + "&type=" + this.type + "&page=" + this.page + "&apikey=" + this.apikey;
        if(debug){console.log(this.url)}
    }
    ,createIMDBIDQueryURL: function () {
        this.url = this.website + "i=" + this.i + "&type=" + this.type + "&plot=" + this.plot + "&apikey=" + this.apikey;
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

// SETUP EVENT HANDLERS ----------------------------------------------
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

    //CLICKED ON A PAGE BUTTON
    $(".div-pages").on("click", function(event){
        if(debug){console.log("Event: clicked on a page button ", event)}       
    
        // TWO conditions required in order to take action:
        // 1. user clicked on a page button
        // 2. page is NOT the current page
        if(event.target.classList[0] === "pages" && movieSearch.page != event.target.attributes[0].value){
            var page = event.target.attributes[0].value;
            console.log("Page requested: ", page);
            //check if a new set of pages/butons need to be displayed later
            checkPageButtons(event);
            //display a page result corresponding the button
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

    //Click on a search result item to see more details
    $(document).on("click",".card", function(){
        if(debug){console.log("Event: clicked on a movie card")}
        $(".list").fadeOut(200);
        $(".individual").fadeIn(500);
        movieSearch.i = $(this).attr("imdbid");
        startAnItemSearch();
    });

    //'GO BACK' to return to the list of search results
    $(".go-back").on("click", function(){
        if(debug){console.log("Event: clicked on 'Go Back' button")}
        event.preventDefault();
        $(".individual").fadeOut(200);
        $(".list").fadeIn(500);
    });

    //Missing Pictures
    $(document).on("error", "img", function(){
        console.log("Event: error with image", this);
    });
});

// ALL ABOUT SEARCH --------------------------------------------

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

function startAnItemSearch(){
    if(debug){console.log("function: startAnItemSearch")}
    //create queryurl
    movieSearch.createIMDBIDQueryURL();
    //send ajax request
    $.ajax({ 
        url: movieSearch.url, 
        method: "GET"
    }).then(function(response){ 
        if(debug){console.log("Ajax response", response);}
        movieSearch.itemDetails = response;
        //display the result
        $("#poster").attr("src", response.Poster);
        $("#title").text(response.Title);
        $("#year").text(response.Year);
        $("#rated").text(response.Rated);
        $("#plot").text(response.Plot);
        $("#actors").text(response.Actors);

    }).catch(function(){
        console.log("Something went wrong with your ajax...");
    });
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
        if(debug){console.log("function: sendAjaxQuery - that page is already stored")}
        var onePage = movieSearch.getAPageOfResults();
        //Proceed to display results
        displayAPage(onePage);
        //display buttons for pages
        createPageButtons();

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
        //display buttons for pages
        createPageButtons();

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
    $(".list").hide();
    if(debug){console.log("function: displayAPage ", onePage)}
    onePage.forEach(function(aMovie){
        if(debug){console.log(aMovie)}
        var card = createACard(aMovie);
        appendCardToResults(card);
    });
    $(".list").fadeIn(800);

}

function createACard(aMovie){
    var card, img, card_body, title, year;

    card = $("<div>").addClass("card").attr("imdbID", aMovie.imdbID);
    img = $("<img>").attr("src",aMovie.Poster);
  
    // card_body = $("<div>").addClass("card-body");
    // title = $("<h6>").addClass("card-title").text(aMovie.Title);
    // year = $("<p>").addClass("year").text(aMovie.Year);

    // card_body.append(title).append(year);
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
    var pageNumber = movieSearch.startPage;

    if(debug){console.log("function: createPageButtons ", movieSearch.startPage)}

    //empty out the buttons
    $(".div-pages").empty();

    //draw only 10 pages/buttons
    for(var i = 0; i < 10 ; i++) {
        
        var newButton = $("<button>").text(pageNumber).attr({"data-page-number":pageNumber, "data-button-number":i+1 } ).addClass("pages btn btn-primary");
        $(".div-pages").append(newButton);
        pageNumber++;

        //check if we have reached the last page/button
        if(pageNumber>numberOfPages) {
            return false;
        }
    }
}

function checkPageButtons(event) {
    if(debug){console.log("function: checkPageButtons")}

    var whichButton = parseInt(event.target.attributes[1].value);

    if(whichButton===1){
        console.log("Decrement by 10");
        movieSearch.startPage-= 10;
        movieSearch.startPage = movieSearch.startPage < 1 ? 1 : movieSearch.startPage;
    } else if(whichButton===10) {
        console.log("Increment by 10");
        movieSearch.startPage+=10;
        movieSearch.startPage = movieSearch.startPage > movieSearch.totalNumberOfPages ? movieSearch.totalNumberOfPages : movieSearch.startPage;
    }
    
    if(debug){
        console.log("Which button: ", whichButton);
        console.log("movieSearch.startPage", movieSearch.startPage);
        console.log("movieSearch.totalNumberOfPages", movieSearch.totalNumberOfPages);
    }
}
