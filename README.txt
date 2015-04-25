Steps for setting up the server:

1) Install node + node package manager (npm).
2) From within the "www" folder, execute "npm install" to download required libraries.
3) Modify "www\JS\Ajax.js" so that the siteAddress points 
     to the correct external IP address of your website.
4) Modify "www\index.html" so that the "Templates" script
     is loaded from the same external IP address of your website
5) Change the square webhooks url to point to the same external IP address of your website.
     This property is located within the "apps" section of the square website.
6) Start up the server by executing "node server\js\server.js"

The server should now be running at 127.0.0.1:3030
Join the chat at https://gitter.im/michaelthearnold/Corvallis.menu
