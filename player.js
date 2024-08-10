// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-3.0
/*
Copyright 2024, jan-ale on github.
Code licensed under GPL 3.0 or any later version.
*/
"use strict";
const button = document.getElementById("button");
const display = document.getElementById("display");
button.addEventListener("click", function() {
  display.innerText = "Button clicked!";
});
// @license-end
