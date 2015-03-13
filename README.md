ImageEdit Angular Module
========================

Use an image, edit it to fit inside a specific size, that you can use to upload wherever and however you want

Install
-------

Copy the angular-image-edit.js and angular-image-edi.css files into your project and add the following line with the correct path:

		<script src="/path/to/scripts/angular-image-edit.js"></script>
		<link rel="stylesheet" href="/path/to/scripts/angular-image-edit.css">


Alternatively, if you're using bower, you can add this to your component.json (or bower.json):

		"angular-image-edit": "~0.2.0"

Or simply run

		bower install angular-image-edit

Check the dependencies to your html (unless you're using wiredep):

		<script src="components/angular/angular.js"></script>

And (unless you're using wiredep):

		<script src="components/angular-image-edit/dist/angular-image-edit.js"></script>

And the css:

		<link rel="stylesheet" href="components/angular-image-edit/dist/angular-image-edit.css">

Add the module to your application

		angular.module("myApp", ["ImageEdit"])


Usage
-----

		</cropme>
        <image-edit
            width="250"
            height="250"
            src="src"
            zoom="zoom"
            type="png">
        </image-edit>
Attributes
----------


#### type (optional)
Valid values are 'png' or 'jpeg' (might work with webm too, haven't tried it)
#### width (optional)
Set the target (cropped) picture width (default 300).
		width="250"
the cropped image will have a width of 250px.
#### height (optional)
Set the target (cropped) picture height (default 300).
		height="250"
the cropped image will have a height of 250px.

#### src
url of the image to edit. IT should be an angular module.
Can contain an data: URL.

#### zoom (optional). (default 0)
Percentage of zooming between 0 and 100.
It can be an angular model or an integer.

Events Sent
----------

The blob will be sent through an event, to catch it inside your app, you can do it like this:

		$scope.$on("ImageEdit:done", function(ev, result) { /* do something */ });

Where result is an object with the following keys:

		blob: edited image as a blob
		uri: edited image as data URL

Also ImageEdit will send an event when a picture set by the user, so you can do something like

		$scope.$on("ImageEdit:loaded", function(ev, width, height) { /* do something when the image is loaded */ });
		$scope.$on("ImageEdit:loadFail", function(ev) { /* do something when the image could not load properly (maybe the src wasn't an url) */ });

Events Received
---------------

And you can trigger the edition  by broadcasting the event ImageEdit:edit, for example:

		$scope.$broadcast("ImageEdit:edit");

So, now, how do I send this image to my server?
-----------------------------------------------

		scope.$on("ImageEdit:edit", function(ev, result) {
			var xhr = new XMLHttpRequest;
			xhr.setRequestHeader("Content-Type", result.blob.type);
			xhr.onreadystatechange = function(e) {
				if (this.readyState === 4 && this.status === 200) {
					return console.log("done");
				} else if (this.readyState === 4 && this.status !== 200) {
					return console.log("failed");
				}
			};
			xhr.open("POST", url, true);
			xhr.send(result.blob);
		});
