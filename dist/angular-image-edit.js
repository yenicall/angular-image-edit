(function () {
    /**
     * @ngdoc overview
     * @name ImageEdit
     * @requires ngTouch, superswipe
     * @description
     * Use an image, resize it, move it to fit in a specific size  and get the blob/data URI, that you can use to upload wherever and however you want
     *
     */
    angular.module('ImageEdit', [])
        .directive('imageEdit', ['$rootScope', '$q', 'canvasToBlob', function ($rootScope, $q, canvasToBlob) {

            function getCoordinates(event) {
                var touches = event.touches && event.touches.length ? event.touches : [event];
                var e = (event.changedTouches && event.changedTouches[0]) ||
                    (event.originalEvent && event.originalEvent.changedTouches &&
                    event.originalEvent.changedTouches[0]) ||
                    touches[0].originalEvent || touches[0];

                return {
                    x: e.clientX,
                    y: e.clientY
                };
            }

            return {
                template: '<div id="image-crop-{{ rand }}" class="ng-image-edit" ng-style="moduleStyles" ng-show="imageLoaded">' +
                '<section ng-style="sectionStyles" class="wrapper">' +
                '<canvas class="canvas"  width="{{ canvasWidth }}" height="{{ canvasHeight }}"></canvas>' +
                '</section></div>',
                replace: true,
                restrict: 'AE',
                link: function (scope, element, attributes) {
                    var $elm = element[0],
                        active = false,
                        $canvas = $elm.getElementsByClassName('canvas')[0],
                        ctx = $canvas.getContext('2d'),
                        $img = new Image(),
                        maxZoomedInLevel,
                        maxZoomedOutLevel = 0.7,
                        zoom = 0,
                        currentX = 0,
                        currentY = 0,
                        minXPos = 0, maxXPos = 0, minYPos = 0, maxYPos = 0,
                        startCoords = {x: 0, y: 0},
                        imgWidth, imgHeight,
                        getBlobData, zoomImage, updateDragBounds, moveImage;

                    scope.imageLoaded = false;
                    scope.rand = Math.round(Math.random() * 99999);
                    scope.width = parseInt(attributes.width, 10) || 300;
                    scope.height = parseInt(attributes.height, 10) || 300;

                    scope.canvasWidth = scope.width;
                    scope.canvasHeight = scope.height;

                    scope.moduleStyles = {
                        width: (scope.width) + 'px',
                        height: (scope.height ) + 'px'
                    };

                    scope.sectionStyles = {
                        width: (scope.width ) + 'px',
                        height: (scope.height ) + 'px'
                    };

                    scope.croppingGuideStyles = {
                        width: scope.width + 'px',
                        height: scope.height + 'px',
                        top: 0,
                        left: 0
                    };
                    attributes.type || (attributes.type = "png");


                    //------------ Watch changes ------------//
                    scope.$watch(attributes.src, function (value) {
                        if (value) {
                            $img.src = value;
                        }
                    });

                    scope.$watch(attributes.zoom, function (value) {
                        value = parseFloat(value);
                        if (!isNaN(value)) {
                            if (value > 100) {
                                value = 100;
                            }
                            zoomImage(value);
                        }
                    });


                    //------------ Private function ------------//
                    getBlobData = function () {
                        var deferred;
                        deferred = $q.defer();
                        canvasToBlob($canvas, (function (blob) {
                            return deferred.resolve(blob);
                        }), "image/" + scope.type);

                        return deferred.promise;
                    };

                    updateDragBounds = function () {
                        imgWidth = $img.width * zoom;
                        imgHeight = $img.height * zoom;
                        if (imgWidth < $canvas.width) {
                            minXPos = 0;
                            maxXPos = $canvas.width - imgWidth;
                        } else {
                            minXPos = $canvas.width - imgWidth;
                            maxXPos = 0;
                        }

                        if (imgHeight < $canvas.height) {
                            minYPos = 0;
                            maxYPos = $canvas.height - imgHeight;
                        } else {
                            minYPos = $canvas.height - imgHeight;
                            maxYPos = 0;
                        }

                    };

                    zoomImage = function (percent) {
                        percent = percent / 100;
                        zoom = percent * maxZoomedOutLevel + (1 - percent) * maxZoomedInLevel;
                        updateDragBounds();

                        if (currentX < minXPos) {
                            currentX = minXPos;
                        } else if (currentX > maxXPos) {
                            currentX = maxXPos;
                        }

                        if (currentY < minYPos) {
                            currentY = minYPos;
                        } else if (currentY > maxYPos) {
                            currentY = maxYPos;
                        }
                        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
                        ctx.drawImage($img, currentY, currentY, imgWidth, imgHeight);
                    };

                    moveImage = function (x, y) {
                        x = currentX + x;
                        if ((x < minXPos) || (x > maxXPos)) {
                            x = currentX;
                        }
                        currentX = x;

                        y = currentY + y;
                        if ((y < minYPos) || (y > maxYPos)) {
                            y = currentY;
                        }
                        currentY = y;

                        ctx.clearRect(0, 0, $canvas.width, $canvas.height);
                        ctx.drawImage($img, x, y, imgWidth, imgHeight);
                    };


                    $img.error = function () {
                        scope.imageLoaded = false;
                        $rootScope.$broadcast("ImageEdit:loadFail");
                    };

                    $img.onload = function () {
                        scope.$apply(function () {
                            scope.imageLoaded = true;
                            var imgWidth = $img.width,
                                imgHeight = $img.height;
                            currentX = 0;
                            currentY = 0;
                            maxZoomedInLevel = (function () {
                                if ($canvas.width > $canvas.height) {
                                    return $canvas.height / imgHeight;
                                }
                                return $canvas.width / imgWidth;
                            })();
                            var percent = parseFloat(attributes.zoom);
                            if (isNaN(percent)) {
                                percent = 0;
                            }

                            zoomImage(percent);

                            $rootScope.$broadcast("ImageEdit:loaded", imgWidth, imgHeight);
                        });


                    };

                    //------------ Events ------------//
                    var handleStart = function (event) {
                            active = true;
                            var coords = getCoordinates(event);
                            startCoords.x = coords.x;
                            startCoords.y = coords.y;
                        },
                        handleMove = function (event) {
                            if (!active) return;
                            event.preventDefault();
                            var coords = getCoordinates(event),
                                deltaX = (coords.x - startCoords.x) * maxZoomedInLevel,
                                deltaY = (coords.y - startCoords.y) * maxZoomedInLevel;
                            moveImage(deltaX, deltaY);
                        },
                        handleEnd = function (event) {
                            if (!active) return;
                            active = false;
                            var coords = getCoordinates(event),
                                deltaX = (coords.x - startCoords.x) * maxZoomedInLevel,
                                deltaY = (coords.y - startCoords.y) * maxZoomedInLevel;
                            moveImage(deltaX, deltaY);
                        },
                        handleCancel = function () {
                            active = false;
                        };

                    $canvas.addEventListener('mousedown', handleStart, false);
                    $canvas.addEventListener('mousemove', handleMove, false);
                    $canvas.addEventListener('mouseup', handleEnd, false);


                    $canvas.addEventListener('touchstart', handleStart, false);
                    $canvas.addEventListener('touchmove', handleMove, false);
                    $canvas.addEventListener('touchend', handleEnd, false);
                    $canvas.addEventListener('touchcancel', handleCancel, false);


                    scope.$on("ImageEdit:edit", function (event) {
                        if (event) {
                            event.preventDefault();
                        }
                        getBlobData().then(function (blob) {
                            $rootScope.$broadcast("ImageEdit:done", {blob: blob, uri: $canvas.toDataURL()});
                        });
                    });

                }
            }
        }])
        .service("canvasToBlob", function () {
            var base64_ranks, decode_base64, is_base64_regex;
            is_base64_regex = /\s*;\s*base64\s*(?:;|$)/i;
            base64_ranks = void 0;
            decode_base64 = function (base64) {
                var buffer, code, i, last, len, outptr, rank, save, state, undef;
                len = base64.length;
                buffer = new Uint8Array(len / 4 * 3 | 0);
                i = 0;
                outptr = 0;
                last = [0, 0];
                state = 0;
                save = 0;
                rank = void 0;
                code = void 0;
                undef = void 0;
                while (len--) {
                    code = base64.charCodeAt(i++);
                    rank = base64_ranks[code - 43];
                    if (rank !== 255 && rank !== undef) {
                        last[1] = last[0];
                        last[0] = code;
                        save = (save << 6) | rank;
                        state++;
                        if (state === 4) {
                            buffer[outptr++] = save >>> 16;
                            if (last[1] !== 61) {
                                buffer[outptr++] = save >>> 8;
                            }
                            if (last[0] !== 61) {
                                buffer[outptr++] = save;
                            }
                            state = 0;
                        }
                    }
                }
                return buffer;
            };
            base64_ranks = new Uint8Array([62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51]);
            return function (canvas, callback, type) {
                var args, blob, data, dataURI, header_end, is_base64;
                if (!type) {
                    type = "image/png";
                }
                if (canvas.mozGetAsFile) {
                    callback(canvas.mozGetAsFile("canvas", type));
                    return;
                }
                args = Array.prototype.slice.call(arguments, 1);
                dataURI = canvas.toDataURL(type);
                header_end = dataURI.indexOf(",");
                data = dataURI.substring(header_end + 1);
                is_base64 = is_base64_regex.test(dataURI.substring(0, header_end));
                blob = void 0;
                if (Blob.fake) {
                    blob = new Blob;
                    if (is_base64) {
                        blob.encoding = "base64";
                    } else {
                        blob.encoding = "URI";
                    }
                    blob.data = data;
                    blob.size = data.length;
                } else if (Uint8Array) {
                    if (is_base64) {
                        blob = new Blob([decode_base64(data)], {
                            type: type
                        });
                    } else {
                        blob = new Blob([decodeURIComponent(data)], {
                            type: type
                        });
                    }
                }
                return callback(blob);
            };
        });
})();