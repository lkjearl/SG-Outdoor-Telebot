# SG Outdoor Telegram Bot

## Description

Utilizing a Telegram messenger chatbot as the front-end interface, this project aims to deliver useful and practical outdoor-related information tailored specifically for users in Singapore.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [License](#license)

## Installation

To run locally/docker:
1. Clone this repository
```bash
git clone <repository_url>
cd sg-outdoor-telebot
```
2. Install required dependencies
```bash
npm install telegraf puppeteer jimp dotenv axios
```
3. Create a '.env' file and add API keys or any environment variables
```bash
TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
```
4. Build and run

Deploy to server (Heroku for example):
1. Install CLI, login, navigate/create project directory
2. Setup environment
```bash
heroku config:set TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
```
3. Deploy application to heroku
```bash
git push heroku main
```
4. Run app

## Usage

~~To use the bot, users can simply search up @SGoutdoorBot and begin usage.~~
Alternatively, it can be hosted natively.

## Features:
1. Real-time Bus Timings:
 - Get up-to-minute bus arrival information based off your location
 - May choose to fetch nearby bus stops using current/input location, or directly fetch bus arrival timing via bus stop code

2. Weather Information:
 - Check current and forecasted weather conditions to plan your outdoor activities
 - Includes 2hr forecast, 24hour forecast, current rain areas mapping, current UV index

3. Direction and Route Planning:
 - Access directions and duration for driving, walking, public transport and cycling
 - Users can specify destination and starting location via manual input or GPS

4. Location-based Services:
 - Receive relevant information and services based on your GPS coordinates

5. User-friendly Interactions:
 - Enjoy seamless experience through the familiar Telegram inferface
 - Inline keyboard and formatted output for visual pleasure

## Technologies Used

- JavaScript
- Node.js
- Telegraf
- dotenv
- Puppeteer
- Jimp
- Axios

## License

MIT