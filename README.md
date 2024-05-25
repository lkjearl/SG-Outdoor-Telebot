# Project Title

SG Outdoor Telegram Bot

## Video Demo

#### Video Demo: <removed>

## Description

The bot is designed to provide users with various outdoor-related information in Singapore. It includes features such as checking the weather forecasts, providing directions and checking bus timings.
Before I reveal how this idea was derived, let me share with you one of my daily struggles: The constant need to help my mother on checking the weather forecast so she can decide on whether to hang the clothes. Occasionally, she would have me help her check on the public transport directions on her phone and the bus timings as well.
And so, a random thought popped up in my mind... Why not make use of technology to lift these burdens off my shoulder!
In other words, this bot is designed with my mother in mind; Or any who may not be adept in using their phones for these purposes.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Code explanation](#code-explanation)
- [License](#license)

## Installation

To run this bot locally:
1. Clone this repository
2. Install required dependencies via 'npm install' (eg. dotenv, telegraf, puppeteer, etc)
3. Create a '.env' file and add API keys or any environment variables (eg. payment token)
4. Start bot by inputting 'node [name of file].js'

To run this bot on server:
1. perform step 1 to 3 from aforementioned local method (user may create a .gitignore file for enhanced security)
2. Install Heroku CLI and relevant dependencies if required (eg. microbot)
3. Push to git, then host on Heroku

## Usage

To use the bot users can simply search up @SGoutdoorBot and begin usage. Although i will have to run the bot locally before so; Since my Heroku's free dyno hours has been used up for other projects.

## Features:
1. Weather Forecast
    Users can access the 'Check Weather' inline button on the landing page. It will prompt them an inline keyboard that has 4 options:
    a. Check 24 hours forecast
        - users will then be prompted to select area (eg. Central) to check the forecast for 3 different time periods
        - for example, user checked the forecast at 9pm, forecast will show current night's forecast, next morning's forecast and next afternoon's forecast
    b. Check 2 hours forecast
        - users will then be prompted to select their specific area (eg. Sentosa) to check the most accurate forecasting
        - forecasting is based on current to next 2 hours
    c. Rain Areas mapping
        - user will be sent an image of the rain areas in Singapore, the image also shows the intensity of rain
        - the image is an image of the current rain areas overlayed on top of Singapore's map
    d. UV index
        - user will receive the current UV levels and UV Ratings

2. Directions
    Users can access the 'Check Direction' inline button on the landing page. Which will prompt them to input or enter their destination via text/typing

    Users will then be prompted to input their current/starting location. They have a choice of using their phone's GPS/current geolocation or to manually input/enter their starting location.

    Users will then be shown information on the mode of transport which includes Driving, Motorcycle, Public Transport, Walking and Cycling; Along with the optimal/fastest travel duration for each transport methods. The information is shown in the form of inline buttons so users can click on any and it will redirect them to google map to view the details on their preferred mode of transport (every detail already pre-input).

3. Bus Timings
    Users can access the 'Check Bus timings' inline button on the landing page. Which will prompt them to choose whether they want to find nearby bus stop's timing or check bus timings using bus code.
    a. Find nearby bus stops timing
        - users can choose whether to use their phone's GPS/current geolocation or to manually type in
        - upon doing so bot will send them up to 7 most nearby bus stops according to their location that was input, in the form of inline buttons
        - upon clicking users will be sent a well-organized table of all currently available bus details: Bus number, Next bus duration and Subsequent bus duration. Along with a 'Last updated at [current time]' tag below the table
    b. Find bus timing using bus stop code
        - users will be prompted to input/enter via text/typing a 5-digit bus stop code, which is exclusive to and shown at every bus stops in Singapore.
        - after which, users will be sent a well-organized table of all currently available bus details: Bus number, Next bus duration and Subsequent bus duration. Along with a 'Last updated at [current time]' tag below the table

## Technologies Used

1. JavaScript
- Main primary programming language used for this project.
2. Node.js
- Bot is built using Node.js, a JS runtime allowing me to run JS on the server-side.
3. Telegraf framework
- A Telegram Bot API library for Node.js. Assist in interaction with Telegram's Bot API.
4. dotenv
- Package to load environment variables such as tokens from a .env file.
5. Puppeteer
- Headless browser automation library. Aid me in performing web scraping and retrieving data.
6. Jimp
- A JavaScript image manipulation library. Aid me on overlaying images.
7. Axios
- HTTP client for making HTTP request to fetch data easily

## Code explanation

1. index.js
    This js file contains codes on launching and graceful stoppage of the bot; Although it can be merged with bot.js, I decided to keep them apart to be more organized
2. .env
    This file contains my environment variables, which is my case is only my bot token; Although it can be merged with bot.js, I separated it for security's sake and incase i push the project to git. This way no one can view my bot token.
3. .gitignore
    This file is exclusively used to signify that .env should not be pushed to git, for security sake as well
4. package.json and package-lock.json
    package.json contains a brief overview on my project, eg. description, dependencies used, etc. package-lock.json contains more details, especially on the dependencies and libraries
5. procfile
    This file is only to be used when hosting on server, user have to remember to export it from their js files. I have left this file blank as I don't have any plans on hosting it
6. weather.js
    This file is specifically made to declare and construct the functions for the bot's weather features. Puppeteer and Jimp is used here. Initially I planned to use a combination of axios and cheerio to do the web scraping, but after facing errors with the rain areas image overlay function, I decided to try out puppeteer and realized it works fine; Thus, the switch.
    Functions are as follows:
    a. 2 hours forecast
        - takes in a location, in this case a specific location such as Woodlands, Novena, etc.
        - it then scrapes the SG NEA weather site, process it and return to the current - 2hour forecast for that specific area
    b. 24 hours forecast
        - similar to '2 hours forecast', it takes in a location area (eg. North, Central, etc)
        - I declared an array for the time period "['night', 'morn', 'afternoon']" and used the current time to decide which is the time period I should scrape and return the results first
        - and following the order/cycle. this way user can have the processed information and more pleasant experience viewing since the next 24 hours forecasts are positioned in a way that begins with their current time period
    c. Rain area mapping
        - functions just scrapes the site for the rain areas overlay image and overlap it with the base map of Singapore's map. Overlaying performed by saving the img locally and using Jimp to do the overlay.
        - user then get a very in-depth satellite version of current rain areas in Singapore with color intensities included in the overlay as well
    d. UV index
        - function just scrapes the site for current UV details, processes data and return to user
7. map.js
    This file contains functions pertaining to the transport/ direction features of the bot. The 2 functions are as follows:
    a. Get Starting address
        - this function doesn't technically 'get' the user's starting address. The function requires a location input, but not any location; The location input when users share their current address using the telegram API's share current location/geolocation. So, the input is actually the longitude and latitude of users current geolocation.
        - function then reverse geocode the lng and lat to a feasible location that is readable by the latter's function. in this case I formatted the location into the location's road, house/unit number, postal/zip code, city and country.
        - function then returns that formatted address
    b. Get directions
        - essentially what this function does is to take in the starting and destination location. access the map site using puppeteer and plot in the data.
        - it then retrieves the most optimal/fastest travel duration for each of the transport mode "['Driving', 'Motorcycle', 'Public Transport', 'Walking', 'Cycling']". It then stores it along with the url to directly access the transport mode's available routes and details.
        - it then returns user something along the lines of eg. Driving (23mins) (url:...), etc. bot.js will parse the information and dish it to the user in a user-friendly and visual pleasing way.
8. bus.js
    This file contains functions for the bot's bus timing feature. The functions are as follows:
    a. Get nearby bus stops
        - this function takes in a starting location and run a google search on nearby bus stops from the location
        - function then scrape the first 7 nearest bus stop names and return the results to user. only 7 results in consideration of not cluttering user's screen
    b. Convert bus stops code
        - this function takes in a bus stop code as an input. first and foremost, the function then verify that it is 5 digit and whether the bus stop code exist/ or is authentic.
        - to verify the veracity of the bus stop code, this function uses axios to fetch the database of all the bus stops in sg from a json online.
        - it will loop through the json and if code exists, the function will get the name of the bus stops tied to the bus stop code from the json array and return to the user; else it returns null.
    c. Get bus timings
        - this function takes in the bus stop name and fetch the data of the currently available bus for that bus stop, and also the next and subsequent bus timings. if bus is arriving or not available, it will display "Arr" or "NA" instead for better readability
        - the function then returns an array of all the data to user
9. bot.js
    This file contains the front-end telegram bot's code. which includes providing user-friendly and visually pleasing interaction between user and the bot. It also imports and parse/format the data gotten from other functions (from other js files). Although I have tried to organize this js file, it is still very lengthy... So, I won't go through every function/event handler here.
    That said I will briefly explain some of the event handlers and functions below:
    - anything beginning with "bot.action..." is an event handler, or rather a callback function in Telegram/JS, my bot is riddled with inline keyboard functions to make it user-friendly and for easier usage, each buttons are tied to a "callback_data", which then trigger the "bot.action('[callback_data]'...)
    - "async" and "await" is to declare asynchronous functions/events/methods. in layman, what "await" does is wait for something to complete, before moving on; And the "async" is required for await to function
    - "try", "catch" block has been explain in the CS50 lectures and notes. in layman, "try" doing something and if unable to do so, catch the error (eg. and send error to console). this helps the bot from not crashing as much because without usage of "try" whole application will crash and stop. But with "try", application can still keep running, and I’ll get to see what happened from the error from my console log.
    - bot.action can also look out for more than one callback. eg. "bot.action(['current_bustops', 'custom_bustops']...)". Doing it this way means you can better organize your codes.
    - "markdownV2" allows you to format your text in your bot, such as bolding, underline. "escapeMarkdown" is a workaround for using "markdownV2", because when using special characters (eg. '.', '-', etc) requires you to add two succession of backslash (\\) before the special characters. defining an "escapeMarkdown" just saves me a lot of effort from adding those backslashes in every text.
    - "bot.on(message('text')...)" is also a callback that triggers when user enter and send a text. any events that require the user to input text, i will define a userChoice (eg. userChoice = 'directions'), by doing so, I can use the if (userchoice === '...') to define what the user's intention are.
    - This weird characters after the location "bot.action(/^location:(.+)$/,...)", is just a callback function that seek for a callback data of "location:..."
    - The last bot.action in the code would be the most challenging to code. Reason why I use this jumble of text "bot.action(/Xb0e71mA3qM:\?(.+)/,...)" is because under the bus timings feature, users have a choice of selecting a list of bus stops that are nearby them and there is no way to define that. So I decided to use a weird jumble of text before the bustop names. So what this callback does is look out for a callback containing "Xb0e71mA3qM:...", then extracting the values after the jumbled text.
    - Within the aforementioned event I also defined a "columnPadding". initially I just wanted to find ways to format the bus timings data since I didn't like the way it was sent out to the user. Using inspiration from CS50's lecture on HTML, I decided to format it like a table to make it visually pleasing. Telegram's API doesn't allow tables so I used fixed width code block (```text```) to imitate a table also with usage of '|' to imitate dividers between the columns. I first declare a header row text, and use the split function on the dividers '|' to find the number of spaces between each divider. I then plot in the bus timings data and using padEnd function to fill in the spaces from "columnPadding" so that it conforms and format similarly to a table!

## License

MIT
