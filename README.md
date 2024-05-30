<div align="center" id="top"> 
    <img style="border-radius:10px;width:500px" src="https://cdn.shopify.com/s/files/1/0330/4443/0983/files/wolf-bot-banner.jpg?v=1717093239" alt="Wolf" />
</div>

<h1 align="center">Wolf Bot</h1>

<p align="center">
  <img alt="Github top language" src="https://img.shields.io/github/languages/top/umarz317/Wolf-Bot?color=56BEB8">
  <img alt="Repository size" src="https://img.shields.io/github/repo-size/umarz317/Wolf-Bot?color=56BEB8">
  <img alt="License" src="https://img.shields.io/github/license/umarz317/Wolf-Bot?color=56BEB8">
</p>

<h4 align="center"> 
	🚧  Wolf 🚀 Under construction...  🚧
</h4> 

<hr>

<!-- <p align="center">
  <a href="#dart-about">About</a> &#xa0; | &#xa0; 
  <a href="#sparkles-features">Features</a> &#xa0; | &#xa0;
  <a href="#rocket-technologies">Technologies</a> &#xa0; | &#xa0;
  <a href="#white_check_mark-requirements">Requirements</a> &#xa0; | &#xa0;
  <a href="#checkered_flag-starting">Starting</a> &#xa0; | &#xa0;
  <a href="#memo-license">License</a> &#xa0; | &#xa0;
  <a href="https://github.com/umarz317" target="_blank">Authors</a>
</p> -->


## :dart: About ##

Wolf is an open-source snipe bot developed for the essentially any EVM-Based Chain written purely in Javascript. Designed with flexibility and efficiency in mind, Wolf enables users to perform manual buy/sell operations as well as traditional sniping with ease. In addition to its sniping capabilities, Wolf includes wallet management features. Users can create and manage up to five wallets, view all assets within these wallets and much more to come in the future!

## :sparkles: Features ##

:heavy_check_mark: Manual Buy/Sell: Execute buy and sell orders manually with precision;

:heavy_check_mark: Traditional Sniping: Automatically snipe new token listings;

:heavy_check_mark: Wallet Management: Create and manage up to five wallets;

:heavy_check_mark: Asset Viewing: View all assets within your wallets;

:heavy_check_mark: Configurable Settings: Tailor the bot's via settings;

:heavy_check_mark: User-friendly Interface: Intuitive design for easy navigation and operation;
## :rocket: Technologies ##

The following tools were used in this project:

- [Node.js](https://nodejs.org/en/)
- [Javascript](https://www.typescriptlang.org/)

## :white_check_mark: Requirements ##

Before starting :checkered_flag:, you need to have [Git](https://git-scm.com) and [Node](https://nodejs.org/en/) installed.

Make sure you have pnpm installed after installing Node.

```bash
npm install -g pnpm
```
## :information_source: Setting up .env file ##

- **Telegram Bot Token**:To integrate Telegram you need a Telegram bot token. For detailed steps, refer to Telegram Integration [here](https://help.zoho.com/portal/en/kb/desk/support-channels/instant-messaging/telegram/articles/telegram-integration-with-zoho-desk).
- **Encryption Key**: To generate the encryption key run the following this will genrate an encryption key ans write it into the **.env** file
```bash
node generateEncryptionKey.js
```
   
- **Moralis Api Key**: Get your Moralis API key by following the instructions at [here](https://docs.moralis.io/2.0/web3-data-api/evm/get-your-api-key).
- **Database Connection String**: Wolf uses a non-relational DB, you can MongoDB's [MongoAtlas](https://www.mongodb.com/cloud/atlas/register?utm_content=rlsapostreg&utm_source=google&utm_campaign=search_gs_pl_evergreen_atlas_general_retarget-brand-postreg_gic-null_emea-all_ps-all_desktop_eng_lead&utm_term=&utm_medium=cpc_paid_search&utm_ad=&utm_ad_campaign_id=14412646473&adgroup=131761130372&cq_cmp=14412646473&gad_source=1&gclid=CjwKCAjwx-CyBhAqEiwAeOcTdV9ihcwZay72nBrx-SS9t63mTfI4pv0SKGVkr81GtigNdHz3CO4qchoC154QAvD_BwE)
You can paste the connection string here for you database.




## :checkered_flag: Starting ##

```bash
# Clone this project
$ git clone https://github.com/umarz317/Wolf-Bot

# Access
$ cd Wolf

# Install dependencies
$ pnpm i

# Run the project
$ node server.js

```

## :memo: License ##

This project is under license from MIT. For more details, see the [LICENSE](LICENSE.md) file.


Made with :heart: by <a href="https://github.com/umarz317" target="_blank">Umar, </a><a href="https://github.com/TahreeemNaeem" target="_blank">Tehreem, </a><a href="https://github.com/talhapro" target="_blank">and Talha</a>

&#xa0;

