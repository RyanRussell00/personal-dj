# A quick background 

The live version of this app is launched on a Heroku server and only the code owner has access to it. As a developer, you're able to run the web app locally as long as you setup the correct environment variables and Spotify settings.

<h1 id="step1"> 1: Setting up Spotify Developer Dashboard</h1>
<ol>
<li>Accept the Developer Terms & Conditions on Spotify: https://developer.spotify.com/dashboard.</li>
<li>Follow the "Register Your App" step from: https://developer.spotify.com/documentation/general/guides/app-settings/#register-your-app</li>
<li>In the Dashboard, select the application you just created and click "Edit Settings" in the top right.
   <br> Add a new callback URI: `http://localhost:8888/callback/`
   <br><b>NOTE:</b> If you get error about the callback URI please read this [StackOverflow](https://stackoverflow.com/a/63406102/8586250)</li>
<li>Keep the Spotify Dashboard open, you'll need it in the next steps.</li>
</ol>

# 2: Setting up Environmental Variables

<b>NOTE: This tutorial only covers how to do it on Windows or Linux. If you use Mac I wish you the best of luck.</b>

## Windows Env Variables

1. Follow this tutorial to get to the Environmental Variables window: https://www.hows.tech/2019/03/how-to-set-environment-variables-in-windows-10.html
2. Open the Spotify Dashboard and select your application.
   <br>
   In the "Environmental Variable" window, click on "New" and enter the following information <b>EXACTLY:</b>
   <br>
   `Variable Name` = `NODE_SPOTIFY_CLIENT_ID`
   <br>
   `Variable Value` = The Client ID from your application
   <br> <br>
   Repeat the steps again, this time:
   <br>
   `Variable Name` = `NODE_SPOTIFY_CLIENT_SECRET`
   <br>
   `Variable Value` = The Client secret from your application
   <br>

## Linux Environmental Variables

<b>NOTE:</b> This was tested using Ubuntu and I'm not sure if it'll work with other distros of Linux.

1. Follow these steps to understand how to create an Env variable: https://stackoverflow.com/a/31546962/8586250

2. Open the Spotify Dashboard and select your application.

3. Create the following environmental variables, please note that the spelling must be exact.
   `NODE_SPOTIFY_CLIENT_ID`=The Client ID from your application
   <br>
   `NODE_SPOTIFY_CLIENT_SECRET`=The Client secret from your application

# 3: Setup local project development

-   Clone the project to local system. Fork the repo @ `https://github.com/RyanRussell00/personal-dj.git` and clone forked repo to local using `git clone <fork-repo>`.
    -   Also, you should install this prettier extension to be used along with `VSCode`: [`esbenp.prettier-vscode`](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- Navigate to the `api` folder and run `npm install`

- Navigate back out to the `ui` folder and run `npm install`

-   Optionally, don't mutate the master branch of the fork - it can help to sync the changes from the original repository. So, you may start to work by creating a new-branch from master.

# 4: Restart your IDE and possibly even computer

For the environmental variables to take effect you'll need to restart your IDE, and possible even your computer.

# 4: Running the application

- In the `api` folder run `npm run dev` and in the `ui` folder run `npm start`

<br> If there are no issues you should be in business! Happy coding :)
